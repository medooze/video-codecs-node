%include "MediaFrame.i"

%{
using VideoDecoderWorkerStats = VideoDecoderWorker::Stats;
%}

struct VideoDecoderWorkerStats
{
	uint64_t timestamp		= 0;
	uint64_t totalDecodedFrames	= 0;
	uint16_t fps			= 0;
	uint16_t maxDecodingTime	= 0;
	uint16_t avgDecodingTime	= 0;
	uint16_t maxWaitingFrameTime	= 0;
	uint16_t avgWaitingFrameTime	= 0;
	uint16_t maxDeinterlacingTime	= 0;
	uint16_t avgDeinterlacingTime	= 0;
};

struct VideoDecoderWorker : public MediaFrameListener
{
	int Start();
	void AddVideoOutput(VideoOutput* ouput);
	void RemoveVideoOutput(VideoOutput* ouput);
	int Stop();

	VideoDecoderWorkerStats GetStats();
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
