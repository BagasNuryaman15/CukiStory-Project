import assert from "node:assert/strict";
import test from "node:test";
import {getProjectTimelineDuration, getScenePlaybackTimings} from "../lib/timing";
import {parseSrt} from "../lib/srt";
import type {CukiProject, CukiScene} from "../lib/types";

test("SRT timeline duration ignores stale scene.duration values", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:02,000
Short cue`);
  const project = makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 3,
    srtCues: cues,
    scenes: [makeScene({
      duration: 99,
      srtCueStartId: cues[0].id,
      srtCueEndId: cues[0].id,
      srtCueStartIndex: cues[0].index,
      srtCueEndIndex: cues[0].index,
    })],
  });

  assert.equal(getProjectTimelineDuration(project), 3);
});

test("SRT playback holds the last visual scene through final audio duration", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:02,000
Short cue`);
  const project = makeProject({
    audioMode: "fullVoSrt",
    audioDuration: 5,
    srtCues: cues,
    scenes: [makeScene({
      duration: 99,
      srtCueStartId: cues[0].id,
      srtCueEndId: cues[0].id,
      srtCueStartIndex: cues[0].index,
      srtCueEndIndex: cues[0].index,
    })],
  });

  const playback = getScenePlaybackTimings(project);

  assert.equal(playback[0].start, 0);
  assert.equal(playback[0].end, 5);
  assert.equal(playback[0].duration, 5);
});

test("SRT playback keeps unmapped preview scenes sequential", () => {
  const project = makeProject({
    audioMode: "fullVoSrt",
    audioDuration: null,
    srtCues: [],
    scenes: [makeScene({duration: 2}), makeScene({duration: 3})],
  });

  const playback = getScenePlaybackTimings(project);

  assert.equal(playback[0].start, 0);
  assert.equal(playback[1].start, 2);
});

test("non-SRT timeline duration uses total scene duration", () => {
  const project = makeProject({
    audioMode: "fullVoEstimated",
    audioDuration: 20,
    scenes: [makeScene({duration: 2}), makeScene({duration: 4.5})],
  });

  assert.equal(getProjectTimelineDuration(project), 6.5);
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
