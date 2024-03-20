%include "MediaFrame.i"

struct VideoDecoderWorker
{
	int Start();
	int Stop();
};

SHARED_PTR_BEGIN(VideoDecoderWorker)
{
	SHARED_PTR_TO(MediaFrameListener)
}
SHARED_PTR_END(VideoDecoderWorker)
