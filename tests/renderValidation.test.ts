import assert from "node:assert/strict";
import test from "node:test";
import {validateForRender} from "../lib/renderValidation";
import {autoMapSrtToScenes, parseSrt} from "../lib/srt";
import type {CukiProject, CukiScene} from "../lib/types";

test("validateForRender blocks missing required assets", () => {
  const validation = validateForRender(makeProject({
    audioUrl: null,
    audioDuration: null,
    scenes: [makeScene({imageUrl: null, subtitle: ""})],
  }));

  assert.match(validation.errors.join("\n"), /Upload a VO audio file/);
  assert.match(validation.errors.join("\n"), /Scene 1: add a panel image/);
  assert.match(validation.errors.join("\n"), /Scene 1: add subtitle text/);
});

test("validateForRender blocks missing story package", () => {
  const validation = validateForRender(makeProject({
    hook: "",
    finalVO: "",
  }));

  assert.match(validation.errors.join("\n"), /Add Final VO/);
  assert.equal(validation.checklist.some((item) => item.id === "story" && !item.ready), true);
});

test("validateForRender blocks incomplete SRT mapping", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
00:00:01,000 --> 00:00:02,000
Two`);
  const validation = validateForRender(makeProject({
    audioMode: "fullVoSrt",
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: [makeScene({srtCueStartId: cues[0].id, srtCueEndId: cues[0].id})],
  }));

  assert.match(validation.errors.join("\n"), /Assign 1 remaining SRT cue/);
});

test("validateForRender allows complete SRT projects", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
00:00:01,000 --> 00:00:02,000
Two`);
  const mappedScenes = autoMapSrtToScenes([makeScene({id: "scene-1"}), makeScene({id: "scene-2"})], cues);
  const validation = validateForRender(makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 2,
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: mappedScenes,
  }));

  assert.deepEqual(validation.errors, []);
});

function makeProject(overrides: Partial<CukiProject> = {}): CukiProject {
  return {
    id: "project",
    title: "Test Project",
    hook: "A strong hook",
    tagline: "",
    finalVO: "Caption",
    youtubeDescription: "",
    hashtags: "",
    notes: "",
    aspectRatio: "9:16",
    fps: 30,
    width: 1080,
    height: 1920,
    audioMode: "fullVoEstimated",
    audioUrl: "data:audio/mp3;base64,ok",
    audioDuration: 3,
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
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
    ...overrides,
  };
}

function makeScene(overrides: Partial<CukiScene> = {}): CukiScene {
  return {
    id: "scene",
    order: 1,
    imageUrl: "data:image/png;base64,ok",
    subtitle: "Caption",
    duration: 3,
    timingSource: "estimated",
    note: "",
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
