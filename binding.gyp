{
	'variables':
	{
		'external_libmediaserver%'		: '<!(echo $LIBMEDIASERVER)',
		'external_libmediaserver_include_dirs%'	: '<!(echo $LIBMEDIASERVER_INCLUDE)',
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
        			'libraries': ["-lpthread -lpthread -lresolv -lavcodec -lswscale -lavformat -lavutil -lvpx -lx264 -lavfilter"]
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
							'media-server/include',
							'media-server/src',
							'media-server/src/rtp',
							'media-server/ext/crc32c/include',
							'media-server/ext/libdatachannels/src',
							'media-server/ext/libdatachannels/src/internal',
							"media-server/src/jpeg",
							"media-server/src/vp8",
							"media-server/src/vp9",
							"media-server/src/h264",
							"media-server/src/h265",
						],
						"sources": 
						[
							"media-server/src/VideoBufferScaler.cpp",
							"media-server/src/VideoCodecFactory.cpp",
							"media-server/src/VideoDecoderWorker.cpp",
							"media-server/src/VideoEncoderWorker.cpp",
							"media-server/src/VideoPipe.cpp",
							"media-server/src/Deinterlacer.cpp",
							"media-server/src/EventLoop.cpp",
							"media-server/src/MediaFrameListenerBridge.cpp",
							"media-server/src/avcdescriptor.cpp",
							"media-server/src/rtp/DependencyDescriptor.cpp",
							"media-server/src/rtp/RTPPacket.cpp",
							"media-server/src/rtp/RTPPayload.cpp",
							"media-server/src/rtp/RTPHeader.cpp",
							"media-server/src/rtp/RTPHeaderExtension.cpp",
							"media-server/src/rtp/LayerInfo.cpp",
							"media-server/src/vp8/vp8encoder.cpp",
							"media-server/src/vp8/vp8decoder.cpp",
							"media-server/src/vp8/vp8depacketizer.cpp",
							"media-server/src/h264/h264encoder.cpp",
							"media-server/src/h264/h264decoder.cpp",
							"media-server/src/h264/h264depacketizer.cpp",
							"media-server/src/h265/h265.cpp",
							"media-server/src/h265/h265decoder.cpp",
							"media-server/src/h265/H265Depacketizer.cpp",
							"media-server/src/h265/HEVCDescriptor.cpp",
							"media-server/src/vp9/VP9Decoder.cpp",
							"media-server/src/vp9/VP9Depacketizer.cpp",
							"media-server/src/VideoLayerSelector.cpp",
							"media-server/src/DependencyDescriptorLayerSelector.cpp",
							"media-server/src/h264/H264LayerSelector.cpp",
							"media-server/src/vp8/VP8LayerSelector.cpp",
							"media-server/src/vp9/VP9LayerSelector.cpp",	
							"media-server/src/jpeg/JPEGEncoder.cpp",
							"media-server/src/webp/WEBPEncoder.cpp"

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

