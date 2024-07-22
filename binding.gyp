{
	'variables':
	{
		'external_libmediaserver%'		: '<!(echo $LIBMEDIASERVER)',
		'external_libmediaserver_include_dirs%'	: '<!(echo $LIBMEDIASERVER_INCLUDE)',
		'medooze_media_server_src' : "<!(node -e \"require('medooze-media-server-src')\")",
	},
	"targets":
	[
		{
			"target_name": "medooze-video-codecs",
			"cflags":
			[
				"-march=native",
				"-fexceptions",
				"-O3",
				"-g",
				"-Wno-unused-function -Wno-comment",
				#"-O0",
				#"-fsanitize=address"
			],
			"cflags_cc":
			[
				"-fexceptions",
				"-std=c++17",
				"-O3",
				"-g",
				"-Wno-unused-function",
				"-faligned-new",
				#"-O0",
				#"-fsanitize=address,leak"
			],
			"include_dirs" :
			[
				'/usr/include/nodejs/',
				"<!(node -e \"require('nan')\")"
			],
			"ldflags" : [" -lpthread -lresolv"],
			"link_settings":
			{
        			'libraries': ["-lpthread -lpthread -lresolv -lavcodec -lswscale -lavformat -lavutil -lvpx -lx264 -lavfilter -laom"]
      			},
			"sources":
			[
				"src/video-codecs_wrap.cxx",
			],
			"conditions":
			[
				[
					"external_libmediaserver == ''",
					{
						"include_dirs" :
						[
							'<(medooze_media_server_src)/include',
							'<(medooze_media_server_src)/src',
							'<(medooze_media_server_src)/src/rtp',
							'<(medooze_media_server_src)/ext/crc32c/include',
							'<(medooze_media_server_src)/ext/libdatachannels/src',
							'<(medooze_media_server_src)/ext/libdatachannels/src/internal',
							"<(medooze_media_server_src)/src/jpeg",
							"<(medooze_media_server_src)/src/vp8",
							"<(medooze_media_server_src)/src/vp9",
							"<(medooze_media_server_src)/src/h264",
							"<(medooze_media_server_src)/src/h265",
							"/usr/local/src/aurora/include"
						],
						"sources":
						[
							"<(medooze_media_server_src)/src/VideoBufferScaler.cpp",
							"<(medooze_media_server_src)/src/VideoCodecFactory.cpp",
							"<(medooze_media_server_src)/src/VideoDecoderWorker.cpp",
							"<(medooze_media_server_src)/src/VideoEncoderWorker.cpp",
							"<(medooze_media_server_src)/src/VideoPipe.cpp",
							"<(medooze_media_server_src)/src/Deinterlacer.cpp",
							"<(medooze_media_server_src)/src/EventLoop.cpp",
							"<(medooze_media_server_src)/src/log.cpp",
							"<(medooze_media_server_src)/src/FrameDelayCalculator.cpp",
							"<(medooze_media_server_src)/src/FrameDispatchCoordinator.cpp",
							"<(medooze_media_server_src)/src/MediaFrameListenerBridge.cpp",
							"<(medooze_media_server_src)/src/avcdescriptor.cpp",
							"<(medooze_media_server_src)/src/rtp/DependencyDescriptor.cpp",
							"<(medooze_media_server_src)/src/rtp/RTPPacket.cpp",
							"<(medooze_media_server_src)/src/rtp/RTPPayload.cpp",
							"<(medooze_media_server_src)/src/rtp/RTPHeader.cpp",
							"<(medooze_media_server_src)/src/rtp/RTPHeaderExtension.cpp",
							"<(medooze_media_server_src)/src/rtp/LayerInfo.cpp",
							"<(medooze_media_server_src)/src/vp8/vp8encoder.cpp",
							"<(medooze_media_server_src)/src/vp8/vp8decoder.cpp",
							"<(medooze_media_server_src)/src/vp8/vp8depacketizer.cpp",
							"<(medooze_media_server_src)/src/h264/h264encoder.cpp",
							"<(medooze_media_server_src)/src/h264/h264decoder.cpp",
							"<(medooze_media_server_src)/src/h264/h264depacketizer.cpp",
							"<(medooze_media_server_src)/src/h265/h265.cpp",
							"<(medooze_media_server_src)/src/h265/h265decoder.cpp",
							"<(medooze_media_server_src)/src/h265/H265Depacketizer.cpp",
							"<(medooze_media_server_src)/src/h265/HEVCDescriptor.cpp",
							"<(medooze_media_server_src)/src/vp9/VP9Decoder.cpp",
							"<(medooze_media_server_src)/src/vp9/VP9Encoder.cpp",
							"<(medooze_media_server_src)/src/vp9/VP9Depacketizer.cpp",
							"<(medooze_media_server_src)/src/vp9/VP9PayloadDescription.cpp",
							"<(medooze_media_server_src)/src/VideoLayerSelector.cpp",
							"<(medooze_media_server_src)/src/DependencyDescriptorLayerSelector.cpp",
							"<(medooze_media_server_src)/src/h264/H264LayerSelector.cpp",
							"<(medooze_media_server_src)/src/vp8/VP8LayerSelector.cpp",
							"<(medooze_media_server_src)/src/vp9/VP9LayerSelector.cpp",	
							"<(medooze_media_server_src)/src/jpeg/JPEGEncoder.cpp",
							"<(medooze_media_server_src)/src/av1/AV1Decoder.cpp",
							"<(medooze_media_server_src)/src/av1/AV1Encoder.cpp",
							"<(medooze_media_server_src)/src/av1/AV1CodecConfigurationRecord.cpp",
							"<(medooze_media_server_src)/src/av1/AV1LayerSelector.cpp",
							"<(medooze_media_server_src)/src/av1/Obu.cpp",
						],
  					        "conditions" : [
								['OS=="mac"', {
									"xcode_settings": {
										"CLANG_CXX_LIBRARY": "libc++",
										"CLANG_CXX_LANGUAGE_STANDARD": "c++17",
										"OTHER_CFLAGS": [ "-Wno-aligned-allocation-unavailable","-march=native"]
									},
								}]
						]
					},
					{
						"libraries"	: [ "<(external_libmediaserver)" ],
						"include_dirs"	: [ "<@(external_libmediaserver_include_dirs)" ],
						'conditions':
						[
							['OS=="linux"', {
								"ldflags" : [" -Wl,-Bsymbolic "],
							}],
							['OS=="mac"', {
									"xcode_settings": {
										"CLANG_CXX_LIBRARY": "libc++",
										"CLANG_CXX_LANGUAGE_STANDARD": "c++17",
										"OTHER_CFLAGS": [ "-Wno-aligned-allocation-unavailable","-march=native"]
									},
							}],
						]
					}
				]
			]
		}
	]
}