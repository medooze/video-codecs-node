%module medooze_video_codecs
%{
#include <nan.h>
#include "VideoCodecFactory.h"
#include "videopipe.h"	
#include "VideoEncoderWorker.h"
#include "VideoDecoderWorker.h"
#include "EventLoop.h"
#include "MediaFrameListenerBridge.h"
extern "C" {
#include "libavcodec/avcodec.h"
}
void log_ffmpeg(void* ptr, int level, const char* fmt, va_list vl)
{
	static int print_prefix = 1;
	char line[1024];

	//if (!Logger::IsUltraDebugEnabled() && level > AV_LOG_ERROR)
	//	return;

	//Format the
	av_log_format_line(ptr, level, fmt, vl, line, sizeof(line), &print_prefix);

	//Remove buffer errors
	//if (strstr(line,"vbv buffer overflow")!=NULL)
		//exit
	//	return;
	//Log
	Log(line);
}

int lock_ffmpeg(void **param, enum AVLockOp op)
{
	//Get mutex pointer
	pthread_mutex_t* mutex = (pthread_mutex_t*)(*param);
	//Depending on the operation
	switch(op)
	 {
		case AV_LOCK_CREATE:
			//Create mutex
			mutex = (pthread_mutex_t*)malloc(sizeof(pthread_mutex_t));
			//Init it
			pthread_mutex_init(mutex,NULL);
			//Store it
			*param = mutex;
			break;
		case AV_LOCK_OBTAIN:
			//Lock
			pthread_mutex_lock(mutex);
			break;
		case AV_LOCK_RELEASE:
			//Unlock
			pthread_mutex_unlock(mutex);
			break;
		case AV_LOCK_DESTROY:
			//Destroy mutex
			pthread_mutex_destroy(mutex);
			//Free memory
			free(mutex);
			//Clean
			*param = NULL;
			break;
	}
	return 0;
}

class VideoCodecs
{
public:
	static void Initialize()
	{
		//Register mutext for ffmpeg
		av_lockmgr_register(lock_ffmpeg);

		//Set log level
		av_log_set_callback(log_ffmpeg);

		//Init avcodecs
		avcodec_register_all();
	}
};
	

class VideoDecoderFacade : public VideoDecoderWorker
{
public: 	
	VideoDecoderFacade() = default;
	~VideoDecoderFacade()
	{
		//Remove listener from old stream
		if (this->incoming) 
			this->incoming->RemoveListener(this);
	}
	
	bool SetIncoming(RTPIncomingMediaStream* incoming)
	{
		//If they are the same
		if (this->incoming==incoming)
			//DO nothing
			return false;
		//Remove listener from old stream
		if (this->incoming) 
			this->incoming->RemoveListener(this);

                //Store stream and receiver
                this->incoming = incoming;
		//Double check
		if (this->incoming)
			//Add us as listeners
			this->incoming->AddListener(this);
		
		//OK
		return true;
	}
	
	int Stop()
	{
		SetIncoming(nullptr);
		return VideoDecoderWorker::Stop();
	}

private:
	RTPIncomingMediaStream* incoming = nullptr;	
};

class VideoEncoderFacade : 
	public VideoEncoderWorker,
	public RTPReceiver
{
public:
	VideoEncoderFacade()
	{
		loop.Start();
	}

	int SetVideoCodec(v8::Local<v8::Value> name, int width, int height, int fps, int bitrate, int intraPeriod, const Properties *properties)
	{
		//Get codec
		auto codec = VideoCodec::GetCodecForName(*Nan::Utf8String(name));
		//Set it
		return codec!=VideoCodec::UNKNOWN ? VideoEncoderWorker::SetVideoCodec(codec, width, height, fps, bitrate, intraPeriod,  properties? *properties : Properties()) : 0;
	}

	virtual int SendPLI(DWORD ssrc)
	{
		VideoEncoderWorker::SendFPU();
		return 1;
	}

	virtual int Reset(DWORD ssrc)
	{
		VideoEncoderWorker::SendFPU();
		return 1;
	}

	TimeService& GetTimeService() { return loop; }
private:
	EventLoop loop;
};

%}

%nodefaultctor VideoCodecs;
%nodefaultdtor VideoCodecs;
struct VideoCodecs
{
	static void Initialize();
};
	
%{
using MediaFrameListener = MediaFrame::Listener;
%}
%nodefaultctor MediaFrameListener;
%nodefaultdtor MediaFrameListener;
struct MediaFrameListener
{
};

%{
using RTPIncomingMediaStreamListener = RTPIncomingMediaStream::Listener;
%}
%nodefaultctor RTPIncomingMediaStreamListener;
%nodefaultdtor RTPIncomingMediaStreamListener;
struct RTPIncomingMediaStreamListener
{
};

%nodefaultctor RTPIncomingMediaStream;
%nodefaultdtor RTPIncomingMediaStream;
struct RTPIncomingMediaStream 
{
	DWORD GetMediaSSRC();
	TimeService& GetTimeService();

	void AddListener(RTPIncomingMediaStreamListener* listener);
	void RemoveListener(RTPIncomingMediaStreamListener* listener);
	void Mute(bool muting);
};


%nodefaultctor MediaFrameListenerBridge;
struct MediaFrameListenerBridge : 
	public RTPIncomingMediaStream,
	public MediaFrameListener
{
	MediaFrameListenerBridge(TimeService& timeService, int ssrc);

	DWORD numFrames;
	DWORD numPackets;
	DWORD numFramesDelta;
	DWORD numPacketsDelta;
	DWORD totalBytes;
	DWORD bitrate;
	DWORD minWaitedTime;
	DWORD maxWaitedTime;
	DWORD avgWaitedTime;
	void Update();
	
	void AddMediaListener(MediaFrameListener* listener);
	void RemoveMediaListener(MediaFrameListener* listener);
	void Stop();
};
//SWIG only supports single class inheritance
MediaFrameListener* MediaFrameListenerBridgeToMediaFrameListener(MediaFrameListenerBridge* bridge);
%{
MediaFrameListener* MediaFrameListenerBridgeToMediaFrameListener(MediaFrameListenerBridge* bridge)
{
	return (MediaFrameListener*)bridge;
}
%}


%nodefaultctor VideoInput;
%nodefaultdtor VideoInput;
struct  VideoInput {};

%nodefaultctor VideoOutput;
%nodefaultdtor VideoOutput;
struct  VideoOutput {};

struct VideoPipe : 
	public VideoInput,
	public VideoOutput
{
	int Init(float scaleResolutionDownBy);
	int End();
};

struct Properties
{
	void SetProperty(const char* key,int intval);
	void SetProperty(const char* key,const char* val);
	void SetProperty(const char* key,bool boolval);
};

%nodefaultctor RTPReceiver;
%nodefaultdtor RTPReceiver;
struct RTPReceiver {};

struct VideoEncoderFacade : public RTPReceiver
{
	VideoEncoderFacade();
	int Init(VideoInput *input);
	bool AddListener(MediaFrameListener *listener);
	bool RemoveListener(MediaFrameListener *listener);
	int SetVideoCodec(v8::Local<v8::Value> name, int width, int height, int fps, int bitrate, int intraPeriod, const Properties *properties );
	int Start();
	int Stop();
	int End();
	int IsEncoding();

	TimeService& GetTimeService();
};

struct VideoDecoderFacade
{
	int Start();
	void AddVideoOutput(VideoOutput* ouput);
	void RemoveVideoOutput(VideoOutput* ouput);
	bool SetIncoming(RTPIncomingMediaStream* incoming);
	int Stop();
};
