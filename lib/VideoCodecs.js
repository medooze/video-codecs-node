const Native		 = require("./Native");
const VideoEncoder	 = require("./VideoEncoder.js");
const VideoDecoder	 = require("./VideoDecoder.js");
const ThumbnailGenerator = require("./VideoDecoder.js");

//Sequence for init the other LFSR instances
const LFSR	  = require('lfsr');
const defaultSeed = new LFSR(8, 92914);

//Replace default seeed
LFSR.prototype._defaultSeed = function(/** @type {number} */ n) {
	if (!n) throw new Error('n is required');
	return defaultSeed.seq(n);
};

/** @typedef {import("./Properties").Properties} Properties */

/**
 * @typedef {Object} TimeStats
 * @property {number} max
 * @property {number} avg
 */

/** @namespace */
const VideoCodecs = {};

/**
 * Close async handlers so nodejs can exit nicely
 * @memberof VideoCodecs
  */
VideoCodecs.terminate = function()
{
	//Set flag
	Native.VideoCodecsModule.Terminate();
};

/**
 * Create a new VideoEnocder
 * @memberof VideoCodecs
 * @param {String} codec Codec name
 * @param {VideoEncoder.CodecParams} params Codec params
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

/**
 * @param {string} encoderCodec encoder name
 * @param {string} codec decoder name
 * @param {Uint8Array} buffer input buffer
 * @returns {Promise<Buffer>} output buffer
 */
VideoCodecs.generateThumbnail = function(encoderCodec, codec, buffer)
{
	return new Promise((resolve, reject) => {
		//New task
		const task = new Native.ThumbnailGeneratorTask({ resolve, reject });
		//Execute it
		task.Run(encoderCodec, codec, buffer);
	}).catch(e => Promise.reject(new Error(e)));
};


/**
 * Enable or disable log level traces
 * @memberof VideoCodecs
 * @param {Boolean} flag
 */
VideoCodecs.enableWarning = function(flag)
{
	//Set flag
	Native.VideoCodecsModule.EnableWarning(flag);
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
