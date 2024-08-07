const Native		= require("./Native");
const SharedPointer	= require("./SharedPointer");
const Emitter		= require("medooze-event-emitter");

/** @typedef {import("./VideoCodecs").TimeStats} TimeStats */

/**
 * @typedef {Object} VideoDecoderStats
 * @property {Date} timestamp
 * @property {number} totalDecodedFrames
 * @property {number} fps
 * @property {TimeStats} decodingTime
 * @property {TimeStats} waitingFrameTime
 * @property {TimeStats} deinterlacingTime
 */

/**
 * @typedef {Object} VideoDecoderEvents
 * @property {(self: VideoDecoder) => void} stopped
 */

/** @extends {Emitter<VideoDecoderEvents>} */
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
		this.decoder = SharedPointer(new Native.VideoDecoderWorkerShared());
		
		//Start decoder
		this.decoder.Start();
		
		//Track listener
		this.ontrackstopped = ()=>{
			//Dettach
			this.detach();
		};
	}

	/**
	 * @returns {VideoDecoderStats | null}
	 */
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
	
	attachTo(/** @type {import("./VideoEncoderIncomingStreamTrack") | undefined} */ track)
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
		
		this.emit("stopped", this);
		
		//Stop emitter
		super.stop();
		
		//Remove native refs
		//@ts-expect-error
		this.decoder = null;
	}
};

module.exports = VideoDecoder;
