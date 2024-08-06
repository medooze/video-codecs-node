const Native		= require("./Native");
const Emitter		= require("medooze-event-emitter");

class VideoDecoder extends Emitter
{
	/**
	 * @ignore
	 * @hideconstructor
	 * private constructor
	 */
	constructor()
	{
		//Init emitter
		super();
		
		//Create decoder
		this.decoder = new Native.VideoDecoderWorkerShared();
		
		//Start decoder
		this.decoder.Start();
		
		//Track listener
		this.ontrackstopped = ()=>{
			//Dettach
			this.detach();
		};
	}

	getStats()
	{
		//Get stats from 
		const stats = this.decoder.GetStats();

		//Ensure they are not too old
		if (stats.timestamp + 1000 < new Date().time)
			//Nothing
			return null;
			
		//Return encoder stats
		return {
			timestamp		: new Date(stats.timestamp),
			totalDecodedFrames	: stats.totalDecodedFrames,
			fps			: stats.fps,
			decodingTime : {
				max		: stats.maxDecodingTime,
				avg		: stats.avgDecodingTime,
			},
			waitingFrameTime : {
				max		: stats.maxWaitingFrameTime,
				avg		: stats.avgWaitingFrameTime,
			},
			deinterlacingTime : {
				max		: stats.maxDeinterlacingTime,
				avg		: stats.avgDeinterlacingTime,
			}
		};
	}
	
	detach()
	{
		//If attached to a decoder
		if (this.attached)
		{
			//Detach native decoder
			this.attached.depacketizer.RemoveMediaListener(this.decoder.toMediaFrameListener());
			//remove listener
			this.attached.off("stopped",this.ontrackstopped);
			
		}
		//Not attached
		this.attached = null;
	}
	
	attachTo(track)
	{
		//Detach first
		this.detach();
		
		//Check if valid object
		if (track)
		{
			//Set incoming
			track.depacketizer.AddMediaListener(this.decoder.toMediaFrameListener());
			//Listen for events
			track.once("stopped",this.ontrackstopped);
			//Keep attached object
			this.attached = track;
		}
	}
	
	stop()
	{
		//Don't call it twice
		if (!this.decoder) return;
		
		//Detach first
		this.detach();
		
		//Stop decoder
		this.decoder.Stop();
		
		/**
		* VideoDecoder stopped event
		*
		* @name stopped
		* @memberof VideoDecoder
		* @kind event
		* @argument {VideoDecoder} decoder
		*/
		this.emit("stopped", this);
		
		//Stop emitter
		super.stop();
		
		//Remove native refs
		this.decoder = null;
	}
};

module.exports = VideoDecoder;
