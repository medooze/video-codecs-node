%module medooze_video_codecs
%{
#include "VideoCodecFactory.h"
#include "VideoPipe.h"	
#include "VideoEncoderWorker.h"
#include "VideoDecoderWorker.h"
#include "EventLoop.h"
#include "MediaFrameListenerBridge.h"

#include <string>
#include <list>
#include <map>
#include <functional>
#include <memory>
#include <nan.h>


template<typename T>
struct CopyablePersistentTraits {
public:
	typedef Nan::Persistent<T, CopyablePersistentTraits<T> > CopyablePersistent;
	static const bool kResetInDestructor = true;
	template<typename S, typename M>
	static inline void Copy(const Nan::Persistent<S, M> &source, CopyablePersistent *dest) {}
	template<typename S, typename M>
	static inline void Copy(const v8::Persistent<S, M>&, v8::Persistent<S, CopyablePersistentTraits<S> >*){}
};

template<typename T>
class NonCopyablePersistentTraits { 
public:
  typedef Nan::Persistent<T, NonCopyablePersistentTraits<T> > NonCopyablePersistent;
  static const bool kResetInDestructor = true;

  template<typename S, typename M>
  static void Copy(const Nan::Persistent<S, M> &source, NonCopyablePersistent *dest);

  template<typename O> static void Uncompilable();
};

template<typename T >
using Persistent = Nan::Persistent<T,NonCopyablePersistentTraits<T>>;


bool MakeCallback(const std::shared_ptr<Persistent<v8::Object>>& persistent, const char* name, int argc = 0, v8::Local<v8::Value>* argv = nullptr)
{
	Nan::HandleScope scope;
	//Ensure we have an object
	if (!persistent)
		return false;
	//Get a local reference
	v8::Local<v8::Object> local = Nan::New(*persistent);
	//Check it is not empty
	if (local.IsEmpty())
		return false;
	//Get event name
	auto method = Nan::New(name).ToLocalChecked();
	//Get attribute 
	auto attr = Nan::Get(local,method);
	//Check 
	if (attr.IsEmpty())
		return false;
	//Create callback function
	auto callback = Nan::To<v8::Function>(attr.ToLocalChecked());
	//Check 
	if (callback.IsEmpty())
		return false;
	//Call object method with arguments
	Nan::MakeCallback(local, callback.ToLocalChecked(), argc, argv);
	
	//Done 
	return true;
}

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

%include "VideoCodecsModule.i"
%include "VideoInput.i"
%include "VideoOutput.i"
%include "VideoPipe.i"


%include "VideoEncoderFacade.i"
%include "VideoDecoderFacade.i"
%include "ThumbnailGenerator.i"



