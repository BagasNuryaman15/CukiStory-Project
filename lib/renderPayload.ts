import type {CukiProject} from "./types";

export const LARGE_RENDER_PAYLOAD_BYTES = 25 * 1024 * 1024;
export const VERY_LARGE_RENDER_PAYLOAD_BYTES = 75 * 1024 * 1024;

export type RenderPayloadEstimate = {
  bytes: number;
  megabytes: number;
  label: string;
  isLarge: boolean;
  isVeryLarge: boolean;
};

export function createRenderRequestBody(project: CukiProject) {
  return JSON.stringify({project});
}

export function estimateRenderPayload(project: CukiProject): RenderPayloadEstimate {
  return estimateSerializedPayload(createRenderRequestBody(project));
}

export function estimateSerializedPayload(payload: string): RenderPayloadEstimate {
  const bytes = new TextEncoder().encode(payload).byteLength;
  const megabytes = bytes / (1024 * 1024);
  return {
    bytes,
    megabytes,
    label: formatPayloadSize(megabytes),
    isLarge: bytes >= LARGE_RENDER_PAYLOAD_BYTES,
    isVeryLarge: bytes >= VERY_LARGE_RENDER_PAYLOAD_BYTES,
  };
}

function formatPayloadSize(megabytes: number) {
  if (megabytes < 0.1) return `${Math.max(0.01, megabytes).toFixed(2)} MB`;
  if (megabytes < 10) return `${megabytes.toFixed(1)} MB`;
  return `${Math.round(megabytes)} MB`;
}
