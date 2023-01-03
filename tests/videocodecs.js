const tap		= require("tap");
const VideoCodecs	= require("../index");

function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}


VideoCodecs.enableDebug(true);
VideoCodecs.enableUltraDebug(true);

tap.test("VideoCodecs",async function(suite){
	
	await suite.test("thumbnail", async function(test){
		try {
			//Create encoder and decoder
			const thumbnail	= await VideoCodecs.generateThumbnail("h264", Buffer.alloc(3));
			//Done
			test.ok(thumbnail)
		} catch (error) {
			//Should not get here
			test.fail(error.message);
		}
		//Test for ok
		test.end();
	});
	/*await suite.test("encoder+decoder", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("h264", {
				width	: 640,
				height	: 380,
				fps	: 30,
				bitrate : 512000
			});
			const videoDecoder	= VideoCodecs.createVideoDecoder();
			//Attach
			videoEncoder.attachTo(videoDecoder);
			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 
			//Attach decoder to encoder video track
			videoDecoder.attachTo(videoTrack);

			await sleep(100)

			//Detach
			videoEncoder.detach();
			videoDecoder.detach();
			
			//Stop all
			videoEncoder.stop();
			videoDecoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});*/
	suite.end();
}).then(() =>
{
	VideoCodecs.terminate();
})

