import type {CukiScene, SrtCue} from "./types";

export type SceneSrtTiming = {
  start: number;
  end: number;
  duration: number;
  baseStart: number;
  baseEnd: number;
  startOffset: number;
  endHold: number;
  cues: SrtCue[];
};

export type SceneVisualTiming = SceneSrtTiming & {
  sceneId: string;
  desiredStart: number;
  shiftedByPrevious: number;
};

const TIMESTAMP_LINE = /(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/;

export function parseSrt(srtText: string): SrtCue[] {
  const normalized = srtText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  return normalized
    .split(/\n{2,}/)
    .flatMap((block, blockIndex) => parseSrtBlock(block, blockIndex))
    .filter((cue) => cue.end > cue.start && cue.text.length > 0)
    .sort((a, b) => a.start - b.start)
    .map((cue, index) => ({...cue, id: cue.id || `srt-${cue.index || index + 1}`}));
}

export function parseSrtTimestamp(timestamp: string): number {
  const match = timestamp.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
  if (!match) return Number.NaN;

  const [, hours, minutes, seconds, milliseconds] = match;
  const paddedMs = milliseconds.padEnd(3, "0").slice(0, 3);
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(paddedMs) / 1000;
}

export function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00:00,000";

  const totalMilliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3600000);
  const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const secs = Math.floor((totalMilliseconds % 60000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${String(milliseconds).padStart(3, "0")}`;
}

export function formatShortTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00.00";

  const totalCentiseconds = Math.round(seconds * 100);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const secs = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;

  return `${pad(minutes)}:${pad(secs)}.${String(centiseconds).padStart(2, "0")}`;
}

export function getSrtDuration(cues: SrtCue[] | undefined) {
  if (!cues || cues.length === 0) return 0;
  return Math.max(...cues.map((cue) => cue.end));
}

export function getSceneSrtCues(scene: Pick<CukiScene, "srtCueStartIndex" | "srtCueEndIndex">, cues: SrtCue[] | undefined) {
  if (!cues || cues.length === 0 || scene.srtCueStartIndex == null || scene.srtCueEndIndex == null) return [];
  const start = Math.min(scene.srtCueStartIndex, scene.srtCueEndIndex);
  const end = Math.max(scene.srtCueStartIndex, scene.srtCueEndIndex);
  return cues.filter((cue) => cue.index >= start && cue.index <= end);
}

export function getSceneSrtTiming(scene: CukiScene, cues: SrtCue[] | undefined): SceneSrtTiming | null {
  const sceneCues = getSceneSrtCues(scene, cues);
  if (sceneCues.length === 0) return null;

  const baseStart = Math.min(...sceneCues.map((cue) => cue.start));
  const baseEnd = Math.max(...sceneCues.map((cue) => cue.end));
  const startOffset = Number.isFinite(scene.srtStartOffset) ? scene.srtStartOffset ?? 0 : 0;
  const endHold = Number.isFinite(scene.srtEndHold) ? Math.max(0, scene.srtEndHold ?? 0) : 0;
  const start = Math.max(0, baseStart + startOffset);
  const automaticEnd = Math.max(start + 0.1, baseEnd + endHold);
  const end = scene.manualDurationOverride && Number.isFinite(scene.duration)
    ? Math.max(start + 0.1, start + scene.duration)
    : automaticEnd;

  return {
    start,
    end,
    duration: Math.max(0.1, end - start),
    baseStart,
    baseEnd,
    startOffset,
    endHold,
    cues: sceneCues,
  };
}

export function getSceneVisualTimings(scenes: CukiScene[], cues: SrtCue[] | undefined): Array<SceneVisualTiming | null> {
  let previousEnd = 0;

  return scenes.map((scene) => {
    const timing = getSceneSrtTiming(scene, cues);
    if (!timing) return null;

    const desiredStart = timing.start;
    const start = Math.max(desiredStart, previousEnd);
    const automaticEnd = Math.max(start + 0.1, start + timing.duration);
    const end = scene.manualDurationOverride && Number.isFinite(scene.duration)
      ? Math.max(start + 0.1, start + scene.duration)
      : automaticEnd;
    previousEnd = end;

    return {
      ...timing,
      sceneId: scene.id,
      start,
      end,
      duration: Math.max(0.1, end - start),
      desiredStart,
      shiftedByPrevious: Math.max(0, start - desiredStart),
    };
  });
}

export function getAssignedSrtCueIndexes(scenes: CukiScene[]) {
  const assigned = new Set<number>();
  scenes.forEach((scene) => {
    if (scene.srtCueStartIndex == null || scene.srtCueEndIndex == null) return;
    const start = Math.min(scene.srtCueStartIndex, scene.srtCueEndIndex);
    const end = Math.max(scene.srtCueStartIndex, scene.srtCueEndIndex);
    for (let index = start; index <= end; index += 1) assigned.add(index);
  });
  return assigned;
}

export function autoMapSrtToScenes(scenes: CukiScene[], cues: SrtCue[]) {
  if (scenes.length === 0 || cues.length === 0) return scenes;

  const sortedCues = [...cues].sort((a, b) => a.start - b.start);
  const firstStart = sortedCues[0].start;
  const totalDuration = Math.max(0.1, sortedCues[sortedCues.length - 1].end - firstStart);
  let cuePointer = 0;

  return scenes.map((scene, sceneIndex) => {
    if (cuePointer >= sortedCues.length) {
      return {
        ...scene,
        srtCueStartIndex: null,
        srtCueEndIndex: null,
        srtStartOffset: scene.srtStartOffset ?? 0,
        srtEndHold: scene.srtEndHold ?? 0,
        manualDurationOverride: false,
      };
    }

    const startCue = cuePointer;
    const remainingScenes = scenes.length - sceneIndex;
    const maxEndCue = sortedCues.length - remainingScenes;
    const targetEnd = firstStart + (totalDuration * (sceneIndex + 1)) / scenes.length;

    while (cuePointer < maxEndCue && sortedCues[cuePointer].end < targetEnd) {
      cuePointer += 1;
    }

    const endCue = Math.max(startCue, cuePointer);
    cuePointer = endCue + 1;

    const duration = Math.max(0.1, sortedCues[endCue].end - sortedCues[startCue].start);
    return {
      ...scene,
      srtCueStartIndex: sortedCues[startCue].index,
      srtCueEndIndex: sortedCues[endCue].index,
      srtStartOffset: scene.srtStartOffset ?? 0,
      srtEndHold: scene.srtEndHold ?? 0,
      duration: duration + Math.abs(Math.min(0, scene.srtStartOffset ?? 0)) + Math.max(0, scene.srtEndHold ?? 0),
      timingSource: "synced" as const,
      manualDurationOverride: false,
    };
  });
}

function parseSrtBlock(block: string, blockIndex: number): SrtCue[] {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const timingLineIndex = lines.findIndex((line) => TIMESTAMP_LINE.test(line));
  if (timingLineIndex === -1) return [];

  const timing = lines[timingLineIndex].match(TIMESTAMP_LINE);
  if (!timing) return [];

  const indexFromFile = timingLineIndex > 0 && /^\d+$/.test(lines[timingLineIndex - 1]) ? Number(lines[timingLineIndex - 1]) : blockIndex + 1;
  const start = parseSrtTimestamp(timing[1]);
  const end = parseSrtTimestamp(timing[2]);
  const text = lines.slice(timingLineIndex + 1).join("\n").trim();

  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];

  return [{
    id: `srt-${indexFromFile}-${Math.round(start * 1000)}`,
    index: indexFromFile,
    start,
    end,
    text,
  }];
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
