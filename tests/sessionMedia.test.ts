import assert from "node:assert/strict";
import test from "node:test";
import {
  clearProjectSessionMedia,
  getProjectAudioSessionMedia,
  getSceneImageSessionMedia,
  rehydrateProjectSessionMedia,
  storeProjectAudioSessionMedia,
  storeSceneImageSessionMedia,
} from "../lib/sessionMedia";
import {saveProject} from "../lib/storage";
import type {CukiProject, CukiScene} from "../lib/types";

test("session media store saves and retrieves audio by project id", () => {
  clearProjectSessionMedia("project-audio");

  storeProjectAudioSessionMedia("project-audio", "data:audio/mp3;base64,voice", 12.34);
  const audio = getProjectAudioSessionMedia("project-audio");

  assert.equal(audio?.audioUrl, "data:audio/mp3;base64,voice");
  assert.equal(audio?.audioDuration, 12.34);
  assert.equal(getProjectAudioSessionMedia("other-project"), null);
});

test("session media store saves and retrieves scene images by project id and scene id", () => {
  clearProjectSessionMedia("project-images");

  storeSceneImageSessionMedia("project-images", "scene-1", "data:image/png;base64,one");
  storeSceneImageSessionMedia("project-images", "scene-2", "data:image/png;base64,two");

  assert.equal(getSceneImageSessionMedia("project-images", "scene-1"), "data:image/png;base64,one");
  assert.equal(getSceneImageSessionMedia("project-images", "scene-2"), "data:image/png;base64,two");
  assert.equal(getSceneImageSessionMedia("project-images", "scene-3"), null);
  assert.equal(getSceneImageSessionMedia("other-project", "scene-1"), null);
});

test("rehydrateProjectSessionMedia attaches session media without changing metadata", () => {
  const project = makeProject({
    id: "project-rehydrate",
    title: "Metadata Title",
    audioUrl: null,
    audioDuration: null,
    scenes: [
      makeScene({id: "scene-1", title: "Scene One", imageUrl: null, visualNotes: "Keep notes"}),
      makeScene({id: "scene-2", title: "Scene Two", imageUrl: null, subtitle: "Keep subtitle"}),
    ],
  });
  clearProjectSessionMedia(project.id);
  storeProjectAudioSessionMedia(project.id, "data:audio/mp3;base64,voice", 8.5);
  storeSceneImageSessionMedia(project.id, "scene-2", "data:image/png;base64,two");

  const rehydrated = rehydrateProjectSessionMedia(project);

  assert.equal(rehydrated.title, "Metadata Title");
  assert.equal(rehydrated.audioUrl, "data:audio/mp3;base64,voice");
  assert.equal(rehydrated.audioDuration, 8.5);
  assert.equal(rehydrated.scenes[0].imageUrl, null);
  assert.equal(rehydrated.scenes[0].visualNotes, "Keep notes");
  assert.equal(rehydrated.scenes[1].imageUrl, "data:image/png;base64,two");
  assert.equal(rehydrated.scenes[1].subtitle, "Keep subtitle");
});

test("saveProject keeps large session media out of localStorage", () => {
  const storage = installLocalStorageMock();
  const project = makeProject({
    id: "project-storage",
    audioUrl: "data:audio/mp3;base64,voice",
    scenes: [makeScene({id: "scene-storage", imageUrl: "data:image/png;base64,panel"})],
  });

  try {
    saveProject(project);
    const storedPayload = [...storage.values()].join("\n");

    assert.equal(storedPayload.includes("data:audio"), false);
    assert.equal(storedPayload.includes("data:image"), false);
    assert.match(storedPayload, /"audioUrl":null/);
    assert.match(storedPayload, /"imageUrl":null/);
  } finally {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

function installLocalStorageMock() {
  const storage = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  };

  Object.defineProperty(globalThis, "window", {value: {}, configurable: true});
  Object.defineProperty(globalThis, "localStorage", {value: localStorageMock, configurable: true});
  return storage;
}

function makeProject(overrides: Partial<CukiProject> = {}): CukiProject {
  return {
    id: "project",
    title: "Session Media Test",
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
    audioDuration: null,
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
