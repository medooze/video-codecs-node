const tap		= require("tap");
const VideoCodecs	= require("../index");

function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}


VideoCodecs.enableLog(true);
VideoCodecs.enableDebug(true);
VideoCodecs.enableUltraDebug(true);

tap.test("VideoCodecs",async function(suite){
	
	await suite.test("thumbnail", async function(test){
		try {
			//Create encoder and decoder
			const thumbnail	= await VideoCodecs.generateThumbnail("h264", Buffer.alloc(3));
			//Should not work
			test.fail("Should not be able to decode frame");
		} catch (error) {
			//Should fail
			test.ok(error);
		}
		//Test for ok
		test.end();
	});

	for (const codec of ["h264","vp8"])
		await suite.test("encoder+decoder " + codec, async function(test){
			try {
				//Create encoder and decoder
				const videoEncoder	= VideoCodecs.createVideoEncoder(codec, {
					width	: 640,
					height	: 380,
					fps	: 30,
					bitrate : 512000,
					properties: {
						"int"		: 128,
						"string"	: "string",
						"boolean"	: true,
						"float"		: 0.1,
						"vp8.threads"	: 4,
						"vp8.cpuused"	: -2,
					}
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
		});
	await suite.test("encoder nested properties", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("vp8", {
				width	: 640,
				height	: 380,
				fps	: 30,
				bitrate : 512000,
				properties: {
					"int"		: 128,
					"string"	: "string",
					"boolean"	: true,
					"float"		: 0.1,
					vp8		: {
						threads	: 4,
						cpuused	: -2,
						"float"	: 0.1,
					}
				}
			});

			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 

			await sleep(100)

			//Stop all
			videoEncoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});
	await suite.test("encoder scaleResolutionDownBy", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("vp8", {
				scaleResolutionBy: 1,
				fps	: 30,
				bitrate : 512000,
				properties: {
					"int"		: 128,
					"string"	: "string",
					"boolean"	: true,
					"float"		: 0.1,
					vp8		: {
						threads	: 4,
						cpuused	: -2,
						"float"	: 0.1,
					}
				}
			});

			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 

			await sleep(100)

			//Stop all
			videoEncoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});
	await suite.test("encoder scaleResolutionDownBy", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("vp8", {
				scaleResolutionBy: 1,
				fps	: 30,
				bitrate : 512000,
				properties: {
					"int"		: 128,
					"string"	: "string",
					"boolean"	: true,
					"float"		: 0.1,
					vp8		: {
						threads	: 4,
						cpuused	: -2,
						"float"	: 0.1,
					}
				}
			});

			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 

			await sleep(100)

			//Stop all
			videoEncoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});
	await suite.test("encoder scaleResolutionToHeight", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("vp8", {
				scaleResolutionToHeigth: 1080,
				fps	: 30,
				bitrate : 512000,
				properties: {
					"int"		: 128,
					"string"	: "string",
					"boolean"	: true,
					"float"		: 0.1,
					vp8		: {
						threads	: 4,
						cpuused	: -2,
						"float"	: 0.1,
					}
				}
			});

			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 

			await sleep(100)

			//Stop all
			videoEncoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});
	await suite.test("encoder scaleResolutionToHeight no allowedDownScaling ", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("vp8", {
				scaleResolutionToHeigth: 1080,
				allowSameHeigth : false,
				fps	: 30,
				bitrate : 512000,
				properties: {
					"int"		: 128,
					"string"	: "string",
					"boolean"	: true,
					"float"		: 0.1,
					vp8		: {
						threads	: 4,
						cpuused	: -2,
						"float"	: 0.1,
					}
				}
			});

			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 

			await sleep(100)

			//Stop all
			videoEncoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});
	await suite.test("encoder scaleResolutionToHeight allowedDownScaling ", async function(test){
		try {
			//Create encoder and decoder
			const videoEncoder	= VideoCodecs.createVideoEncoder("vp8", {
				scaleResolutionToHeigth: 1080,
				allowSameHeigth : true,
				fps	: 30,
				bitrate : 512000,
				properties: {
					"int"		: 128,
					"string"	: "string",
					"boolean"	: true,
					"float"		: 0.1,
					vp8		: {
						threads	: 4,
						cpuused	: -2,
						"float"	: 0.1,
					}
				}
			});

			//Create video track
			const videoTrack = videoEncoder.createIncomingStreamTrack(); 

			await sleep(100)

			//Stop all
			videoEncoder.stop();
			//Test for ok
			test.end();
		} catch (error) {
			console.error(error);
			//Should not get here
			test.fail();
		}
	});
	suite.end();
}).then(() =>
{
	VideoCodecs.terminate();
})

