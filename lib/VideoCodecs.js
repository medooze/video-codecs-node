const Native		 = require("./Native");
const VideoEncoder	 = require("./VideoEncoder.js");
const VideoDecoder	 = require("./VideoDecoder.js");
const ThumbnailGenerator = require("./VideoDecoder.js");

//Sequence for init the other LFSR instances
const LFSR	  = require('lfsr');
const defaultSeed = new LFSR(8, 92914);

//Replace default seeed
LFSR.prototype._defaultSeed = function(n) {
	if (!n) throw new Error('n is required');
	return defaultSeed.seq(n);
};

/** @namespace */
const VideoCodecs = {};

//Initialize library
Native.VideoCodecsModule.Initialize();

/**
 * Close async handlers so nodejs can exit nicely
 * Only call it once!
 * @memberof RTMPServer
  */
VideoCodecs.terminate = function()
{
	//Set flag
	Native.VideoCodecsModule.Terminate();
};

/**
 * Create a new VideoEnocder
 * @memberof VideoCodecs
 * @param {String} codec		Codec name
 * @param {Object} params		Codec params
 * @param {Number} params.width 
 * @param {Number} params.height
 * @param {Number} params.fps
 * @param {Number} params.bitrate
 * @param {Number} params.intraPeriod
 * @param {Object} params.properties	Codec specific properties 
 * @returns {VideoEnocder} The new created encoder
 */
VideoCodecs.createVideoEncoder = function(codec,params)
{
	return new VideoEncoder(codec,params);
};


/**
 * Create a new VideoDecoder
 * @memberof VideoCodecs
 * @returns {VideoDecoder} The new created decoder
 */
VideoCodecs.createVideoDecoder = function()
{
	return new VideoDecoder();
};

VideoCodecs.generateThumbnail = function(encoderCodec, codec, buffer)
{
	return new Promise((resolve, reject) =>
	{
		
		//New task
		const task = new Native.ThumbnailGeneratorTask({
			resolve : (a)=>{
				resolve(a)
			}, 
			reject : (e)=>{
				reject(new Error(e));
			}
		});
		//Execute it
		task.Run(encoderCodec, codec, buffer);
	});
};


/**
 * Enable or disable log level traces
 * @memberof VideoCodecs
 * @param {Boolean} flag
 */
VideoCodecs.enableLog= function(flag)
{
	//Set flag
	Native.VideoCodecsModule.EnableLog(flag);
};


/**
 * Enable or disable debug level traces
 * @memberof VideoCodecs
 * @param {Boolean} flag
 */
VideoCodecs.enableDebug = function(flag)
{
	//Set flag
	Native.VideoCodecsModule.EnableDebug(flag);
};

/**
 * Enable or disable ultra debug level traces
 * @memberof VideoCodecs
 * @param {Boolean} flag
 */
VideoCodecs.enableUltraDebug = function(flag)
{
	//Set flag
	Native.VideoCodecsModule.EnableUltraDebug(flag);
};

module.exports = VideoCodecs;
