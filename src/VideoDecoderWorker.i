%include "MediaFrame.i"

struct VideoDecoderWorker
{
	int Start();
	void AddVideoOutput(VideoOutput* ouput);
	void RemoveVideoOutput(VideoOutput* ouput);
	int Stop();
};

SHARED_PTR_BEGIN(VideoDecoderWorker)
{
	SHARED_PTR_TO(MediaFrameListener)
}
SHARED_PTR_END(VideoDecoderWorker)
