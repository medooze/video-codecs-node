const Native		= require("./Native");
const Emitter		= require("./Emitter");
const LFSR		= require('lfsr');
const VideoEncoderIncomingStreamTrack = require("./VideoEncoderIncomingStreamTrack");

class VideoEncoder extends Emitter
{
	/**
	 * @ignore
	 * @hideconstructor
	 * private constructor
	 */
	constructor(codec,params)
	{
		//Init emitter
		super();
		//Create code
		const encoder = new Native.VideoEncoderFacade();
		//Create properties
		const properties = new Native.Properties();
		//If we have no width or height and param is not set, just set value to 1
		const scaleResolutionDownBy = params.scaleResolutionDownBy ? parseFloat(params.scaleResolutionDownBy) : parseFloat(!params.width && !params.height ? 1 : 0);
		//Get default for width and heigths
		const width  = parseInt(params.width)  ? parseInt(params.width)  : (scaleResolutionDownBy ? 640 : 0);
		const height = parseInt(params.height) ? parseInt(params.height) : (scaleResolutionDownBy ? 480 : 0);
		//Set codec
		if (!encoder.SetVideoCodec(codec,width,height,parseInt(params.fps),parseInt(params.bitrate),parseInt(params.intraPeriod || 0),properties))
			//Error
			throw new Error("Wrong params or video codec not supported");
		//Storea codec
		this.encoder = encoder;
		//And audio pipe
		this.pipe = new Native.VideoPipe();
		//Init pipe
		this.pipe.Init(scaleResolutionDownBy);
		//Set it in encoder
		this.encoder.Init(this.pipe);
		//Start encoding
		this.encoder.Start();
		
		//Create new sequence generator
		this.lfsr = new LFSR();
		
		//Track maps
		this.tracks = new Map();
	}
	
	createIncomingStreamTrack(trackId)
	{
		//Create the source
		const source = new Native.MediaFrameListenerBridge(this.lfsr.seq(31));
		//Add track
		const track = new VideoEncoderIncomingStreamTrack(trackId,this.encoder,source); 
		//Add it to the encoder
		this.encoder.AddListener(source);
		//Add listener
		track.once("stopped",(track)=>{
			//Remove source from listener
			this.encoder.RemoveListener(source);
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
	
	attachTo(decoder)
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
		
		/**
		* VideoEncoder stopped event
		*
		* @name stopped
		* @memberof VideoEncoder
		* @kind event
		* @argument {VideoEncoder} encoder
		*/
		this.emitter.emit("stopped", this);
		
		//Stop emitter
		super.stop();
		
		//Stop pipe
		this.encoder.End();
		//Stop pipe
		this.pipe.End();
			
		//Remove brdige reference, so destructor is called on GC
		this.pipe = null;
		this.encoder = null;
	}
};

module.exports = VideoEncoder;
