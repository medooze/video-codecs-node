struct VideoPipe : 
	public VideoInput,
	public VideoOutput
{
	int Init(float scaleResolutionDownBy);
	int End();
};

