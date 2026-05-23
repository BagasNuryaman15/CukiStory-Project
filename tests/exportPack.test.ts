import assert from "node:assert/strict";
import test from "node:test";
import {createProjectExportPack} from "../lib/exportPack";
import {parseSrt} from "../lib/srt";
import type {CukiProject, CukiScene} from "../lib/types";

test("createProjectExportPack exports production text files and omits large session assets", () => {
  const cues = parseSrt(`1
00:00:00,000 --> 00:00:01,000
Opening`);
  const project = makeProject({
    srtRaw: "1\n00:00:00,000 --> 00:00:01,000\nOpening",
    srtCues: cues,
    scenes: [makeScene({srtCueStartId: cues[0].id, srtCueEndId: cues[0].id})],
  });

  const files = createProjectExportPack(project);
  const filenames = files.map((file) => file.filename);
  const projectJson = files.find((file) => file.filename.endsWith("project_data.json"))?.content ?? "";

  assert.equal(files.length, 5);
  assert.equal(filenames.some((filename) => filename.endsWith("final_vo.txt")), true);
  assert.equal(filenames.some((filename) => filename.endsWith("youtube_metadata.txt")), true);
  assert.equal(filenames.some((filename) => filename.endsWith("scene_timeline.md")), true);
  assert.equal(filenames.some((filename) => filename.endsWith("subtitles.srt")), true);
  assert.equal(projectJson.includes("data:image"), false);
  assert.match(projectJson, /session-only image omitted/);
});

function makeProject(overrides: Partial<CukiProject> = {}): CukiProject {
  return {
    id: "project",
    title: "Export Test",
    hook: "Hook",
    tagline: "Tagline",
    finalVO: "Opening",
    youtubeDescription: "Description",
    hashtags: "#shorts",
    notes: "Notes",
    aspectRatio: "9:16",
    fps: 30,
    width: 1080,
    height: 1920,
    audioMode: "fullVoSrt",
    audioUrl: "data:audio/mp3;base64,ok",
    audioDuration: 1,
    srtRaw: "",
    srtCues: [],
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
    title: "Opening",
    imageUrl: "data:image/png;base64,ok",
    subtitle: "Opening",
    duration: 1,
    timingSource: "synced",
    note: "",
    visualNotes: "Visual note",
    sfxNotes: "SFX note",
    status: "ready",
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
