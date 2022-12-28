%include "Properties.i"
%include "EventLoop.i"
%include "MediaFrame.i"
%include "RTPReceiver.i"
%include "VideoInput.i"

%{

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

struct VideoEncoderFacade : public RTPReceiver
{
	VideoEncoderFacade();
	int Init(VideoInput *input);
	bool AddListener(const MediaFrameListenerShared& listener);
	bool RemoveListener(const MediaFrameListenerShared& listener);
	int SetVideoCodec(v8::Local<v8::Value> name, int width, int height, int fps, int bitrate, int intraPeriod, const Properties *properties );
	int Start();
	int Stop();
	int End();
	int IsEncoding();

	TimeService& GetTimeService();
};