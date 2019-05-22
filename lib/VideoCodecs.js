const Native		= require("./Native");
const VideoEncoder	= require("./VideoEncoder.js");
const VideoDecoder	= require("./VideoDecoder.js");

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
Native.VideoCodecs.Initialize();

/**
 * Create a new VideoEnocder
 * @memberof VideoCodecs
 * @param {String} codec Codec name
 * @param {Object} params Codec params
 * @param {Number} params.width 
 * @param {Number} params.height
 * @param {Number} params.fps
 * @param {Number} params.bitrate
 * @param {Number} params.intraPeriod
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

module.exports = VideoCodecs;
