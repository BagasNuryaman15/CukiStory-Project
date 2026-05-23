import assert from "node:assert/strict";
import test from "node:test";
import {getStepReadiness} from "../lib/stepReadiness";
import {autoMapSrtToScenes, parseSrt} from "../lib/srt";
import type {CukiProject, CukiScene} from "../lib/types";

test("voice step is not ready without audio", () => {
  const project = makeProject({
    audioUrl: null,
    audioDuration: null,
    srtCues: [],
    srtFileName: null,
  });

  assert.equal(getStepReadiness(project, "voice").status, "notStarted");
});

test("voice step is not ready without SRT in Full VO SRT mode", () => {
  const project = makeProject({
    audioMode: "fullVoSrt",
    audioUrl: "data:audio/mp3;base64,ok",
    audioDuration: 2,
    srtCues: [],
    srtFileName: null,
  });

  assert.equal(getStepReadiness(project, "voice").status, "inProgress");
});

test("voice step needs attention when SRT is invalid", () => {
  const cues = parseSrt(`1
bad-time --> 00:00:01,000
Broken`);
  const project = makeProject({
    audioMode: "fullVoSrt",
    audioUrl: "data:audio/mp3;base64,ok",
    audioDuration: 2,
    srtCues: cues,
    srtFileName: "voice.srt",
  });

  assert.equal(getStepReadiness(project, "voice").status, "needsAttention");
});

test("scenes step is not ready when a scene is not mapped", () => {
  const cues = makeCues();
  const project = makeProject({
    audioMode: "fullVoSrt",
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: [makeScene({imageUrl: "data:image/png;base64,ok"})],
  });

  assert.equal(getStepReadiness(project, "scenes").status, "needsAttention");
});

test("scenes step is not ready when image is missing", () => {
  const cues = makeCues();
  const project = makeProject({
    audioMode: "fullVoSrt",
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: [makeScene({srtCueStartId: cues[0].id, srtCueEndId: cues[0].id, imageUrl: null})],
  });

  assert.notEqual(getStepReadiness(project, "scenes").status, "ready");
});

test("preview step is ready only when required render checks pass", () => {
  const incomplete = makeProject({
    audioUrl: null,
    audioDuration: null,
  });
  const complete = makeCompleteSrtProject();

  assert.notEqual(getStepReadiness(incomplete, "preview").status, "ready");
  assert.equal(getStepReadiness(complete, "preview").status, "ready");
});

function makeCompleteSrtProject() {
  const cues = makeCues();
  return makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 3,
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: autoMapSrtToScenes([
      makeScene({id: "scene-1", imageUrl: "data:image/png;base64,one"}),
      makeScene({id: "scene-2", imageUrl: "data:image/png;base64,two"}),
    ], cues),
  });
}

function makeCues() {
  return parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
00:00:01,000 --> 00:00:02,000
Two

3
00:00:02,000 --> 00:00:03,000
Three`);
}

function makeProject(overrides: Partial<CukiProject> = {}): CukiProject {
  return {
    id: "project",
    title: "Step Readiness Test",
    hook: "A strong hook",
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
    audioUrl: "data:audio/mp3;base64,ok",
    audioDuration: 3,
    srtRaw: "",
    srtCues: makeCues(),
    srtFileName: "voice.srt",
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
    imageUrl: "data:image/png;base64,ok",
    subtitle: "Caption",
    duration: 3,
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
