const Native		= require("./Native");
const Emitter		= require("./Emitter");

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
		this.emitter.emit("stopped", this);
		
		//Stop emitter
		super.stop();
		
		//Remove native refs
		this.decoder = null;
	}
};

module.exports = VideoDecoder;
