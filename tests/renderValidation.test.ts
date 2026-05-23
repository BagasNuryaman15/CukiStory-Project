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

test("validateForRender warns for missing story package instead of blocking render", () => {
  const validation = validateForRender(makeProject({
    title: "",
    hook: "",
    finalVO: "",
  }));

  assert.equal(validation.errors.some((error) => /Story Package/.test(error)), false);
  assert.match(validation.warnings.join("\n"), /Story Package is incomplete/);
  assert.equal(validation.checklist.some((item) => item.id === "story" && !item.ready && !item.required), true);
});

test("validateForRender allows technically complete SRT render with empty story package", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
00:00:01,000 --> 00:00:02,000
Two`);
  const mappedScenes = autoMapSrtToScenes([makeScene({id: "scene-1"}), makeScene({id: "scene-2"})], cues);
  const validation = validateForRender(makeProject({
    title: "",
    hook: "",
    finalVO: "",
    audioMode: "fullVoSrt",
    audioDuration: 2,
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: mappedScenes,
  }));

  assert.deepEqual(validation.errors, []);
  assert.match(validation.warnings.join("\n"), /Story Package is incomplete/);
});

test("validateForRender warns for missing Final VO without blocking MP4 render", () => {
  const validation = validateForRender(makeProject({
    finalVO: "",
  }));

  assert.equal(validation.errors.some((error) => /Final VO/.test(error)), false);
  assert.match(validation.warnings.join("\n"), /Final VO text is missing/);
});

test("validateForRender warns for missing title or hook without blocking MP4 render", () => {
  const validation = validateForRender(makeProject({
    title: "",
    hook: "",
  }));

  assert.equal(validation.errors.some((error) => /Title|hook/.test(error)), false);
  assert.match(validation.warnings.join("\n"), /Title or hook is missing/);
});

test("validateForRender still blocks required technical checks", () => {
  const validation = validateForRender(makeProject({
    title: "",
    hook: "",
    finalVO: "",
    audioMode: "fullVoSrt",
    audioUrl: null,
    audioDuration: null,
    srtCues: [],
    srtFileName: null,
    scenes: [makeScene({imageUrl: null})],
  }));

  assert.match(validation.errors.join("\n"), /Upload a VO audio file/);
  assert.match(validation.errors.join("\n"), /SRT has no valid subtitle cues/);
  assert.match(validation.errors.join("\n"), /map this scene to SRT cues/);
  assert.match(validation.errors.join("\n"), /Scene 1: add a panel image/);
  assert.equal(validation.checklist.some((item) => item.id === "story" && !item.ready), true);
});

test("validateForRender warns when some SRT cues are unassigned", () => {
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

  assert.equal(validation.errors.some((error) => /Assign 1 remaining SRT cue/.test(error)), false);
  assert.match(validation.warnings.join("\n"), /Some SRT cues are not assigned to any scene/);
});

test("validateForRender blocks invalid SRT scene mappings", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
00:00:01,000 --> 00:00:02,000
Two`);
  const validation = validateForRender(makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 2,
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: [makeScene({srtCueStartId: cues[0].id, srtCueEndId: null})],
  }));

  assert.match(validation.errors.join("\n"), /choose an end SRT cue/);
  assert.equal(validation.checklist.some((item) => item.id === "mapping" && !item.ready && item.required), true);
});

test("validateForRender warns about duplicate or overlapping SRT mappings", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
00:00:01,000 --> 00:00:02,000
Two

3
00:00:02,000 --> 00:00:03,000
Three`);
  const validation = validateForRender(makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 3,
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: [
      makeScene({id: "scene-1", srtCueStartId: cues[0].id, srtCueEndId: cues[1].id}),
      makeScene({id: "scene-2", srtCueStartId: cues[1].id, srtCueEndId: cues[2].id}),
    ],
  }));

  assert.deepEqual(validation.errors, []);
  assert.match(validation.warnings.join("\n"), /assigned to more than one scene/);
  assert.match(validation.warnings.join("\n"), /mappings overlap/);
});

test("validateForRender blocks invalid SRT cues that were preserved by the parser", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
One

2
bad-time --> 00:00:02,000
Two`);
  const mappedScenes = autoMapSrtToScenes([makeScene({id: "scene-1"})], cues);
  const validation = validateForRender(makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 2,
    srtCues: cues,
    srtFileName: "voice.srt",
    scenes: mappedScenes,
  }));

  assert.match(validation.errors.join("\n"), /Cue 2 has an invalid timestamp/);
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
