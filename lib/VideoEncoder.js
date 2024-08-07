const Native		= require("./Native");
const Emitter		= require("medooze-event-emitter");
const SharedPointer	= require("./SharedPointer");
const Properties	= require("./Properties")
const LFSR		= require("lfsr");
const VideoEncoderIncomingStreamTrack = require("./VideoEncoderIncomingStreamTrack");

//@ts-expect-error
const parseInt = /** @type {(x: number) => number} */ (global.parseInt);
//@ts-expect-error
const parseFloat = /** @type {(x: number) => number} */ (global.parseFloat);

/** @typedef {import("./VideoCodecs").TimeStats} TimeStats */

/**
 * @typedef {Object} VideoEncoderStats
 * @property {Date} timestamp
 * @property {number} totalEncodedFrames
 * @property {number} fps
 * @property {number} bitrate
 * @property {TimeStats} encodingTime
 * @property {TimeStats} capturingTime
 */

/**
 * @typedef {Object} CodecParams
 * @property {number} [width] (integer)
 * @property {number} [height] (integer)
 * @property {number} fps (integer)
 * @property {number} bitrate (integer)
 * @property {number} [intraPeriod] (integer)
 * @property {number} [scaleResolutionDownBy] (float)
 * @property {number} [scaleResolutionToHeight] (integer)
 * @property {boolean} [allowSameHeight]
 * @property {Properties} properties
 */

/**
 * @typedef {Object} VideoEncoderEvents
 * @property {(self: VideoEncoder) => void} stopped
 */

/** @extends {Emitter<VideoEncoderEvents>} */
class VideoEncoder extends Emitter
{
	/**
	 * @ignore
	 * @hideconstructor
	 * private constructor
	 */
	constructor(
		/** @type {string} */ codec,
		/** @type {CodecParams} */ params)
	{
		//Init emitter
		super();
		//Create code
		const encoder = new Native.VideoEncoderFacade();
		//Get encoding properties
		const properties = Properties.fromObject(params.properties);

		//If we have no width or height and param is not set, just set value to 1
		const scaleResolutionDownBy = params.scaleResolutionDownBy ? parseFloat(params.scaleResolutionDownBy) : parseFloat(!params.width && !params.height ? 1 : 0);
		const scaleResolutionToHeight = params.scaleResolutionToHeight ? parseInt(params.scaleResolutionToHeight) : 0;
		const allowedDownScaling = scaleResolutionToHeight && params.hasOwnProperty("allowSameHeight")? (params.allowSameHeight ? 1 : 2) : 0;
		//Get default for width and heights
		const width  = params.width  ? parseInt(params.width)  : (scaleResolutionDownBy ? 640 : 0);
		const height = params.height ? parseInt(params.height) : (scaleResolutionDownBy ? 480 : 0);
		//Set codec
		if (!encoder.SetVideoCodec(codec,width,height,parseInt(params.fps),parseInt(params.bitrate),parseInt(params.intraPeriod || 0), properties))
			//Error
			throw new Error("Wrong params or video codec not supported");
		//Storea codec
		this.encoder = encoder;
		//And audio pipe
		this.pipe = new Native.VideoPipe();
		//Init pipe
		this.pipe.Init(scaleResolutionDownBy, scaleResolutionToHeight, /** @type {Native.VideoPipeAllowedDownScaling} */ (allowedDownScaling));
		//Set it in encoder
		this.encoder.Init(this.pipe);
		//Start encoding
		this.encoder.Start();
		
		//Create new sequence generator
		this.lfsr = new LFSR();
		
		//Track maps
		this.tracks = new Map();
	}
	
	/**
	 * @param {number} delayms delay in milliseconds
	 */
	setMaxDelay(delayms) 
	{
		this.pipe.SetMaxDelay(delayms);
	}

	/**
	 * @returns {VideoEncoderStats | null}
	 */
	getStats()
	{
		//Get stats from 
		const stats = this.encoder.GetStats();

		//Ensure they are not too old
		if (stats.timestamp + 1000 < new Date().getTime())
			//Nothing
			return null;
			
		//Return encoder stats
		return {
			timestamp		: new Date(stats.timestamp),
			totalEncodedFrames	: stats.totalEncodedFrames,
			fps			: stats.fps,
			bitrate			: stats.bitrate,
			encodingTime : {
				max		: stats.maxEncodingTime,
				avg		: stats.avgEncodingTime,
			},
			capturingTime : {
				max		: stats.maxCapturingTime,
				avg		: stats.avgCapturingTime,
			}
		};
	}

	/**
	 * @param {string} trackId (unused. FIXME: please remove)
	 * @param {Native.FrameDispatchCoordinatorShared} frameDispatchCoordinator
	 * @returns 
	 */
	createIncomingStreamTrack(trackId, frameDispatchCoordinator)
	{
		//Create the source
		const bridge = SharedPointer(new Native.MediaFrameListenerBridgeShared(this.encoder.GetTimeService(), this.lfsr.seq(31)));
		if (frameDispatchCoordinator)
			bridge.SetFrameDispatchCoordinator(frameDispatchCoordinator);
		
		//Add track
		const track = new VideoEncoderIncomingStreamTrack(bridge); 
		//Add it to the encoder
		this.encoder.AddListener(bridge.toMediaFrameListener());
		//Add listener
		track.once("stopped",(track)=>{
			//Remove source from listener
			this.encoder.RemoveListener(bridge.toMediaFrameListener());
			//Stop bridge
			bridge.Stop();
			//Remove from map
			this.tracks.delete(track.getId());
		});
		//Add to tracks
		this.tracks.set(track.getId(),track);
		//Done
		return track;
	}
	detach()
	{
		//If attached to a decoder
		if (this.attached)
			//Remove our pipe
			this.attached.decoder.RemoveVideoOutput(this.pipe);
		//Not attached
		this.attached = null;
	}

	
	attachTo(/** @type {import("./VideoDecoder") | undefined} */decoder)
	{
		//Detach first
		this.detach();
		
		//Check if valid object
		if (decoder && decoder.decoder)
		{
			//Set it
			decoder.decoder.AddVideoOutput(this.pipe);
			//Keep attached object
			this.attached = decoder;
			//Add listener
			decoder.once("stopped",(decoder)=>{
				//If it was ours
				if (decoder==this.attached)
					//Not attached
					this.attached = null;
			});
		}
	}
	
	
	stop()
	{
		//Don't call it twice
		if (!this.encoder) return;
		
		//Detach first
		this.detach();
		
		//Stop encoding
		this.encoder.Stop();
		
		//Stop tracks
		for (const [trackId,track] of this.tracks)
			//Stop it
			track.stop();
		
		this.emit("stopped", this);
		
		//Stop emitter
		super.stop();
		
		//Stop pipe
		this.encoder.End();
		//Stop pipe
		this.pipe.End();
			
		//Remove brdige reference, so destructor is called on GC
		//@ts-expect-error
		this.pipe = null;
		//@ts-expect-error
		this.encoder = null;
	}
};

module.exports = VideoEncoder;
