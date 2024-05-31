%{


class ThumbnailGeneratorTask
{
public:
	ThumbnailGeneratorTask( v8::Local<v8::Object> promise)
	{
		persistent = std::make_shared<Persistent<v8::Object>>(promise);
	}

	void Run(const char* encoderName, const char* decoderName, v8::Local<v8::Object> buffer)
	{
		Log("-ThumbnailGeneratorTask::Run() [encoder:%s,decoder:%s]\n", encoderName, decoderName);

		//Get codec for encoding
		VideoCodec::Type encoderCodec = VideoCodec::GetCodecForName(encoderName);

		//If not found
		if (encoderCodec==VideoCodec::UNKNOWN)
			return VideoCodecsModule::Async([=,cloned=persistent](){
				Nan::HandleScope scope;
				int i = 0;
				v8::Local<v8::Value> argv[1];
				argv[i++] = Nan::New("Unknown encoder codec").ToLocalChecked();
				//Call method
				MakeCallback(cloned,"reject",i,argv);
			});

		//Cast to array view
		v8::Local<v8::Uint8Array> uint8array = v8::Local<v8::Uint8Array>::Cast(buffer);
		//Get data and size
		//TODO: Fix this to prevent potential memory corruption by modifying buffer while running task in thread
		const uint8_t* data = (const uint8_t*)uint8array->Buffer()->GetBackingStore()->Data() + uint8array->ByteOffset();
		const uint32_t size = uint8array->ByteLength();

		

		//Get codec for 
		VideoCodec::Type codec = VideoCodec::GetCodecForName(decoderName);

		//If not found
		if (codec==VideoCodec::UNKNOWN)
			return VideoCodecsModule::Async([=,cloned=persistent](){
				Nan::HandleScope scope;
				int i = 0;
				v8::Local<v8::Value> argv[1];
				argv[i++] = Nan::New("Unknown codec").ToLocalChecked();
				//Call method
				MakeCallback(cloned,"reject",i,argv);
			});

		//Generate thumbanail in a different thread
		auto thread = new std::thread([=, videoFrame = std::make_shared<VideoFrame>(codec, std::make_shared<Buffer>(data,size)), cloned=persistent](){
			//Create encoder
			Properties properties;
			std::unique_ptr<VideoEncoder> encoder(VideoCodecFactory::CreateEncoder(encoderCodec,properties));

			//Check
			if (!encoder)
				return VideoCodecsModule::Async([=,cloned=cloned](){
					Nan::HandleScope scope;
					int i = 0;
					v8::Local<v8::Value> argv[1];
					argv[i++] = Nan::New("Could not open encoder").ToLocalChecked();
					//Call method
					MakeCallback(cloned,"reject",i,argv);
				});

			//Set
			encoder->SetFrameRate(1, 2000, 0);

			//Create decoder
			std::unique_ptr<VideoDecoder> decoder(VideoCodecFactory::CreateDecoder(codec));

			//Check
			if (!decoder)
				return VideoCodecsModule::Async([=,cloned=cloned](){
					Nan::HandleScope scope;
					int i = 0;
					v8::Local<v8::Value> argv[1];
					argv[i++] = Nan::New("Could not open decoder").ToLocalChecked();
					//Call method
					MakeCallback(cloned,"reject",i,argv);
				});

			//Decode frame
			if(!decoder->Decode(videoFrame))
				return VideoCodecsModule::Async([=,cloned=cloned](){
					Nan::HandleScope scope;
					int i = 0;
					v8::Local<v8::Value> argv[1];
					argv[i++] = Nan::New("Could not decode frame").ToLocalChecked();
					//Call method
					MakeCallback(cloned,"reject",i,argv);
				});

			//Get frame
			auto videoBuffer = decoder->GetFrame();

			//Check decoded frame
			if (!videoBuffer)
				return VideoCodecsModule::Async([=,cloned2=cloned](){
					Nan::HandleScope scope;
					int i = 0;
					v8::Local<v8::Value> argv[1];
					argv[i++] = Nan::New("Empty decoded frame").ToLocalChecked();
					//Call method
					MakeCallback(cloned2,"reject",i,argv);
				});

			//Set decoded size 
			if (!encoder->SetSize(videoBuffer->GetWidth(),videoBuffer->GetHeight()))
				return VideoCodecsModule::Async([=,cloned2=cloned](){
					Nan::HandleScope scope;
					int i = 0;
					v8::Local<v8::Value> argv[1];
					argv[i++] = Nan::New("Error setting thumbnail size").ToLocalChecked();
					//Call method
					MakeCallback(cloned2,"reject",i,argv);
				});

			//Encoder jpeb
			auto frame = encoder->EncodeFrame(videoBuffer);

			//Check
			if (!frame)
				return VideoCodecsModule::Async([=,cloned=cloned](){
					Nan::HandleScope scope;
					int i = 0;
					v8::Local<v8::Value> argv[1];
					argv[i++] = Nan::New("Error encoding thumnnail").ToLocalChecked();
					//Call method
					MakeCallback(cloned,"reject",i,argv);
				});
			
			
			//Get frame buffer
			Buffer::shared buffer = frame->GetBuffer();
		
			Debug("-ThumbnailGeneratorTask::Run() Thumbnail generated [size:%d]\n",buffer->GetSize());

			//Run function on main node thread
			VideoCodecsModule::Async([=,cloned=cloned](){
				Nan::HandleScope scope;
				int i = 0;
				v8::Local<v8::Value> argv[1];
				//Create local args
				argv[i++] = Nan::CopyBuffer(reinterpret_cast<const char*>(buffer->GetData()), buffer->GetSize()).ToLocalChecked();
				//Call object method with arguments
				MakeCallback(cloned, "resolve", i, argv);
			});
		});

		thread->detach();
	}
private:
	std::shared_ptr<Persistent<v8::Object>> persistent;
};

%}

class ThumbnailGeneratorTask
{
public:
	ThumbnailGeneratorTask(v8::Local<v8::Object> promise);
	void Run(const char* encoderName, const char* decoderName, v8::Local<v8::Object> buffer);
};