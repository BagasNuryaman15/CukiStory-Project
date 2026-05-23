import assert from "node:assert/strict";
import test from "node:test";
import {autoMapSrtToScenes, getAssignedSrtCueIds, getSceneSrtCues, getSceneStatus, getSceneVisualTimings, getSceneVoSegment, parseSrt, validateSrtCues} from "../lib/srt";
import type {CukiScene} from "../lib/types";

test("parseSrt supports comma and dot timestamps and sorts cues by start time", () => {
  const cues = parseSrt(`2
00:00:02.000 --> 00:00:03.250
Second cue

1
00:00:00,500 --> 00:00:01,500
First cue`);

  assert.equal(cues.length, 2);
  assert.equal(cues[0].text, "First cue");
  assert.equal(cues[0].start, 0.5);
  assert.equal(cues[1].end, 3.25);
  assert.match(cues[0].id, /^srt-cue-1-500-1500-/);
});

test("validateSrtCues blocks overlaps and empty cue lists", () => {
  assert.equal(validateSrtCues([]).isValid, false);

  const cues = parseSrt(`1
00:00:00,000 --> 00:00:02,000
First

2
00:00:01,500 --> 00:00:03,000
Second`);
  const validation = validateSrtCues(cues);

  assert.equal(validation.isValid, false);
  assert.match(validation.errors.map((error) => error.message).join("\n"), /overlaps/);
});

test("id-based mapping does not over-select duplicate SRT file indexes", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
Alpha

1
00:00:01,000 --> 00:00:02,000
Beta`);
  const scene = makeScene({
    srtCueStartId: cues[0].id,
    srtCueEndId: cues[0].id,
    srtCueStartIndex: cues[0].index,
    srtCueEndIndex: cues[0].index,
  });

  const mapped = getSceneSrtCues(scene, cues);
  const assigned = getAssignedSrtCueIds([scene], cues);

  assert.deepEqual(mapped.map((cue) => cue.text), ["Alpha"]);
  assert.equal(assigned.size, 1);
  assert.equal(assigned.has(cues[1].id), false);
});

test("autoMapSrtToScenes writes stable cue ids and assigns every cue", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
Opening

2
00:00:01,000 --> 00:00:02,000
Middle

3
00:00:02,000 --> 00:00:03,000
Ending`);

  const scenes = autoMapSrtToScenes([makeScene({id: "scene-1"}), makeScene({id: "scene-2"})], cues);
  const assigned = getAssignedSrtCueIds(scenes, cues);

  assert.equal(scenes[0].srtCueStartId, cues[0].id);
  assert.equal(typeof scenes[0].srtCueEndId, "string");
  assert.equal(assigned.size, cues.length);
});

test("scene status and VO segment are derived from mapped cues and image state", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
Opening

2
00:00:01,000 --> 00:00:02,000
Middle`);
  const scene = makeScene({
    imageUrl: null,
    srtCueStartId: cues[0].id,
    srtCueEndId: cues[1].id,
  });

  assert.equal(getSceneStatus(scene, cues), "image_missing");
  assert.equal(getSceneVoSegment(scene, cues), "Opening Middle");
  assert.equal(getSceneStatus({...scene, imageUrl: "data:image/png;base64,ok"}, cues), "ready");
});

test("visual timings delay later scenes when previous scene holds", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
First

2
00:00:01,000 --> 00:00:02,000
Second`);
  const scenes = [
    makeScene({id: "scene-1", srtCueStartId: cues[0].id, srtCueEndId: cues[0].id, srtEndHold: 1}),
    makeScene({id: "scene-2", srtCueStartId: cues[1].id, srtCueEndId: cues[1].id}),
  ];

  const visualTimings = getSceneVisualTimings(scenes, cues);

  assert.equal(visualTimings[0]?.end, 2);
  assert.equal(visualTimings[1]?.start, 2);
  assert.equal(visualTimings[1]?.shiftedByPrevious, 1);
});

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
