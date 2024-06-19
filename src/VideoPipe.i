%{
using VideoPipeAllowedDownScaling = VideoPipe::AllowedDownScaling;
%}

enum VideoPipeAllowedDownScaling;

struct VideoPipe : 
	public VideoInput,
	public VideoOutput
{
	int Init(float scaleResolutionDownBy, uint32_t scaleResolutionToHeigth, VideoPipeAllowedDownScaling allowedDownscaling);
	int End();
	void SetMaxDelay(uint32_t maxDelay);
};



