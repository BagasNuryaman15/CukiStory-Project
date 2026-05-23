import assert from "node:assert/strict";
import test from "node:test";
import {createRenderRequestBody, estimateRenderPayload, estimateSerializedPayload, LARGE_RENDER_PAYLOAD_BYTES} from "../lib/renderPayload";
import type {CukiProject, CukiScene} from "../lib/types";

test("createRenderRequestBody includes session media for current MVP render flow", () => {
  const body = createRenderRequestBody(makeProject({
    audioUrl: "data:audio/mp3;base64,voice",
    scenes: [makeScene({imageUrl: "data:image/png;base64,panel"})],
  }));

  assert.match(body, /data:audio/);
  assert.match(body, /data:image/);
});

test("estimateRenderPayload reports payload size and large threshold", () => {
  const smallEstimate = estimateRenderPayload(makeProject());
  const largeEstimate = estimateSerializedPayload("x".repeat(LARGE_RENDER_PAYLOAD_BYTES));

  assert.equal(smallEstimate.isLarge, false);
  assert.equal(largeEstimate.isLarge, true);
  assert.equal(largeEstimate.bytes, LARGE_RENDER_PAYLOAD_BYTES);
  assert.match(largeEstimate.label, /MB/);
});

function makeProject(overrides: Partial<CukiProject> = {}): CukiProject {
  return {
    id: "project",
    title: "Payload Test",
    hook: "Hook",
    tagline: "",
    finalVO: "Voice",
    youtubeDescription: "",
    hashtags: "",
    notes: "",
    aspectRatio: "9:16",
    fps: 30,
    width: 1080,
    height: 1920,
    audioMode: "fullVoSrt",
    audioUrl: null,
    audioDuration: 1,
    srtRaw: "",
    srtCues: [],
    srtFileName: null,
    globalSubtitleStyle: "cukiBoldMeme",
    globalImageEffect: "slowZoomIn",
    globalTransition: "hardCut",
    effectSpeed: "normal",
    transitionDuration: 0.25,
    subtitleMode: "full",
    subtitleSize: "normal",
    subtitlePosition: "lowerThird",
    scenes: [makeScene()],
    createdAt: "2026-05-23T00:00:00.000Z",
    updatedAt: "2026-05-23T00:00:00.000Z",
    ...overrides,
  };
}

function makeScene(overrides: Partial<CukiScene> = {}): CukiScene {
  return {
    id: "scene",
    order: 1,
    title: "Scene",
    imageUrl: null,
    subtitle: "Caption",
    duration: 1,
    timingSource: "estimated",
    note: "",
    visualNotes: "",
    sfxNotes: "",
    status: "empty",
    srtCueStartId: null,
    srtCueEndId: null,
    srtCueStartIndex: null,
    srtCueEndIndex: null,
    srtStartOffset: 0,
    srtEndHold: 0,
    manualDurationOverride: false,
    effect: "slowZoomIn",
    transition: "hardCut",
    transitionDuration: 0.25,
    subtitleStyle: "cukiBoldMeme",
    ...overrides,
  };
}
