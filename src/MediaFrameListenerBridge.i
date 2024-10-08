%{
#include "MediaFrameListenerBridge.h"
%}

%include "EventLoop.i"
%include "RTPIncomingMediaStream.i"
%include "RTPReceiver.i"
%include "MediaFrame.i"
%include "FrameDispatchCoordinator.i"

%nodefaultctor MediaFrameListenerBridge;
struct MediaFrameListenerBridge : 
	public RTPIncomingMediaStream,
	public RTPReceiver,
	public MediaFrameListener,
	public MediaFrameProducer
{

	QWORD numFrames;
	QWORD numPackets;
	QWORD numFramesDelta;
	QWORD numPacketsDelta;
	QWORD totalBytes;
	DWORD bitrate;
	DWORD minWaitedTime;
	DWORD maxWaitedTime;
	DWORD avgWaitedTime;
	WORD width;
	WORD height;
	QWORD iframes;
	QWORD iframesDelta;
	QWORD bframes;
	QWORD bframesDelta;
	QWORD pframes;
	QWORD pframesDelta;

	void Update();
	
	void Stop();

	//From MediaFrameProducer
	void AddMediaListener(const MediaFrameListenerShared& listener);
	void RemoveMediaListener(const MediaFrameListenerShared& listener);

	void SetTargetBitrateHint(uint32_t targetBitrateHint);

	void SetFrameDispatchCoordinator(const FrameDispatchCoordinatorShared& coordinator);
%extend 
{
	void SetMaxDelayMs(uint32_t maxDelayMs)
	{
		self->SetMaxDelayMs(std::chrono::milliseconds(maxDelayMs));
	}
}
};

SHARED_PTR_BEGIN(MediaFrameListenerBridge)
{
	MediaFrameListenerBridgeShared(TimeService& timeService, int ssrc)
	{
		return new std::shared_ptr<MediaFrameListenerBridge>(MediaFrameListenerBridge::Create(timeService, ssrc));
	}
	SHARED_PTR_TO(RTPIncomingMediaStream)
	SHARED_PTR_TO(RTPReceiver)
	SHARED_PTR_TO(MediaFrameListener)
	SHARED_PTR_TO(MediaFrameProducer)
}
SHARED_PTR_END(MediaFrameListenerBridge)