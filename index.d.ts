export * from "./build/types/VideoCodecs";

export type VideoDecoder = import("./build/types/VideoDecoder");
export type VideoEncoder = import("./build/types/VideoEncoder");
export type { CodecParams } from "./build/types/VideoEncoder";
export type VideoEncoderIncomingStreamTrack = import("./build/types/VideoEncoderIncomingStreamTrack");

export type {
	ActiveEncodingInfo, ActiveLayersInfo,
	EncodingStats, LayerStats, MediaStats, PacketWaitTime, TrackStats,
} from "./build/types/VideoEncoderIncomingStreamTrack";
