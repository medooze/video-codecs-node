%{

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
	
	bool SetIncoming(const RTPIncomingMediaStream::shared& incoming)
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
	RTPIncomingMediaStream::shared incoming;	
};


%}

%include "RTPIncomingMediaStream.i"

struct VideoDecoderFacade
{
	int Start();
	void AddVideoOutput(VideoOutput* ouput);
	void RemoveVideoOutput(VideoOutput* ouput);
	bool SetIncoming(const RTPIncomingMediaStreamShared& incoming);
	int Stop();
};
