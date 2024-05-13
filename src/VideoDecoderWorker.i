%include "MediaFrame.i"

struct VideoDecoderWorker : public MediaFrameListener
{
	int Start();
	void AddVideoOutput(VideoOutput* ouput);
	void RemoveVideoOutput(VideoOutput* ouput);
	int Stop();
};

SHARED_PTR_BEGIN(VideoDecoderWorker)
{
	VideoDecoderWorkerShared()
	{
		return new std::shared_ptr<VideoDecoderWorker>(new VideoDecoderWorker());
	}
	SHARED_PTR_TO(MediaFrameListener)
}
SHARED_PTR_END(VideoDecoderWorker)
