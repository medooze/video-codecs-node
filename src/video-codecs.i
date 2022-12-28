%module medooze_video_codecs
%{
#include <nan.h>
#include "VideoCodecFactory.h"
#include "videopipe.h"	
#include "VideoEncoderWorker.h"
#include "VideoDecoderWorker.h"
#include "EventLoop.h"
#include "MediaFrameListenerBridge.h"
%}

%typemap(in) v8::Local<v8::Object> {
	$1 = v8::Local<v8::Object>::Cast($input);
}
%typemap(in) v8::Local<v8::Value> {
	$1 = v8::Local<v8::Value>::Cast($input);
}

%include "shared_ptr.i"
%include "EventLoop.i"
%include "MediaFrame.i"
%include "MediaFrameListenerBridge.i"
%include "Properties.i"
%include "RTPIncomingMediaStream.i"

%include "VideoCodecs.i"
%include "VideoInput.i"
%include "VideoOutput.i"
%include "VideoPipe.i"


%include "VideoEncoderFacade.i"
%include "VideoDecoderFacade.i"



