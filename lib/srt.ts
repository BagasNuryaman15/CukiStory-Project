import type {CukiScene, SceneStatus, SrtCue, SrtValidationResult} from "./types";

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

const TIMESTAMP_ARROW_LINE = /(.+?)\s*-->\s*(.+)/;

export function parseSrt(srtText: string): SrtCue[] {
  const normalized = srtText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  return normalized
    .split(/\n{2,}/)
    .flatMap((block, blockIndex) => parseSrtBlock(block, blockIndex))
    .sort(compareCueStart)
    .map((cue, index) => ({...cue, id: createStableCueId(cue, index)}));
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
  const validEnds = cues.map((cue) => cue.end).filter((end) => Number.isFinite(end));
  return validEnds.length > 0 ? Math.max(...validEnds) : 0;
}

export function validateSrtCues(cues: SrtCue[] | undefined): SrtValidationResult {
  const errors: SrtValidationResult["errors"] = [];
  const warnings: SrtValidationResult["warnings"] = [];

  if (!cues || cues.length === 0) {
    errors.push({message: "SRT has no valid subtitle cues."});
    return {isValid: false, errors, warnings};
  }

  cues.forEach((cue, index) => {
    if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end)) {
      errors.push({message: `Cue ${cue.index} has an invalid timestamp.`, cueId: cue.id});
    }
    if (Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end <= cue.start) {
      errors.push({message: `Cue ${cue.index} must end after it starts.`, cueId: cue.id});
    }
    if (!cue.text.trim()) {
      errors.push({message: `Cue ${cue.index} has empty subtitle text.`, cueId: cue.id});
    }

    const previousCue = cues[index - 1];
    if (!previousCue) return;

    if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || !Number.isFinite(previousCue.start) || !Number.isFinite(previousCue.end)) {
      return;
    }

    if (cue.start < previousCue.start) {
      errors.push({message: `Cue ${cue.index} starts before the previous cue.`, cueId: cue.id});
    }
    if (cue.start < previousCue.end) {
      errors.push({message: `Cue ${previousCue.index} overlaps cue ${cue.index}.`, cueId: cue.id});
    }
    if (cue.start - previousCue.end > 2.5) {
      warnings.push({message: `There is a ${formatShortTimestamp(cue.start - previousCue.end)} gap before cue ${cue.index}.`, cueId: cue.id});
    }
  });

  return {isValid: errors.length === 0, errors, warnings};
}

export function getSceneSrtCueRange(
  scene: Pick<CukiScene, "srtCueStartId" | "srtCueEndId" | "srtCueStartIndex" | "srtCueEndIndex">,
  cues: SrtCue[] | undefined,
) {
  if (!cues || cues.length === 0) return null;

  if (scene.srtCueStartId && scene.srtCueEndId) {
    const startPosition = cues.findIndex((cue) => cue.id === scene.srtCueStartId);
    const endPosition = cues.findIndex((cue) => cue.id === scene.srtCueEndId);
    if (startPosition !== -1 && endPosition !== -1) {
      const start = Math.min(startPosition, endPosition);
      const end = Math.max(startPosition, endPosition);
      return {start, end, cues: cues.slice(start, end + 1)};
    }
  }

  if (scene.srtCueStartIndex == null || scene.srtCueEndIndex == null) return null;
  const startIndex = Math.min(scene.srtCueStartIndex, scene.srtCueEndIndex);
  const endIndex = Math.max(scene.srtCueStartIndex, scene.srtCueEndIndex);
  const legacyCues = cues.filter((cue) => cue.index >= startIndex && cue.index <= endIndex);
  if (legacyCues.length === 0) return null;

  const positions = legacyCues.map((cue) => cues.findIndex((item) => item.id === cue.id)).filter((position) => position !== -1);
  const start = Math.min(...positions);
  const end = Math.max(...positions);
  return {start, end, cues: cues.slice(start, end + 1)};
}

export function getSceneSrtCues(scene: Pick<CukiScene, "srtCueStartId" | "srtCueEndId" | "srtCueStartIndex" | "srtCueEndIndex">, cues: SrtCue[] | undefined) {
  return getSceneSrtCueRange(scene, cues)?.cues ?? [];
}

export function getSceneSrtTiming(scene: CukiScene, cues: SrtCue[] | undefined): SceneSrtTiming | null {
  const sceneCues = getSceneSrtCues(scene, cues);
  if (sceneCues.length === 0) return null;
  if (sceneCues.some((cue) => !isValidTimingCue(cue))) return null;

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

export function getAssignedSrtCueIds(scenes: CukiScene[], cues: SrtCue[] | undefined) {
  const assigned = new Set<string>();
  scenes.forEach((scene) => {
    getSceneSrtCues(scene, cues).forEach((cue) => assigned.add(cue.id));
  });
  return assigned;
}

export function getSceneStatus(scene: CukiScene, cues: SrtCue[] | undefined, isSrtMode = true): SceneStatus {
  const hasImage = Boolean(scene.imageUrl);
  const hasMapping = isSrtMode ? Boolean(getSceneSrtTiming(scene, cues)) : Boolean(scene.subtitle.trim());

  if (!hasMapping && !hasImage) return "empty";
  if (hasMapping && !hasImage) return "image_missing";
  if (hasMapping && hasImage) return "ready";
  return "mapped";
}

export function getSceneVoSegment(scene: CukiScene, cues: SrtCue[] | undefined) {
  return getSceneSrtCues(scene, cues).map((cue) => cue.text.trim()).filter(Boolean).join(" ");
}

export function autoMapSrtToScenes(scenes: CukiScene[], cues: SrtCue[]) {
  const validCues = cues.filter(isValidTimingCue);
  if (scenes.length === 0 || validCues.length === 0) return scenes;

  const sortedCues = [...validCues].sort((a, b) => a.start - b.start);
  const firstStart = sortedCues[0].start;
  const totalDuration = Math.max(0.1, sortedCues[sortedCues.length - 1].end - firstStart);
  let cuePointer = 0;

  return scenes.map((scene, sceneIndex) => {
    if (cuePointer >= sortedCues.length) {
      return {
        ...scene,
        srtCueStartId: null,
        srtCueEndId: null,
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
      srtCueStartId: sortedCues[startCue].id,
      srtCueEndId: sortedCues[endCue].id,
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

export function resetSceneSrtMappings(scenes: CukiScene[]): CukiScene[] {
  return scenes.map((scene) => ({
    ...scene,
    srtCueStartId: null,
    srtCueEndId: null,
    srtCueStartIndex: null,
    srtCueEndIndex: null,
    manualDurationOverride: false,
    timingSource: "estimated" as const,
  }));
}

function parseSrtBlock(block: string, blockIndex: number): SrtCue[] {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const timingLineIndex = lines.findIndex((line) => TIMESTAMP_ARROW_LINE.test(line));
  if (timingLineIndex === -1) return [];

  const timing = lines[timingLineIndex].match(TIMESTAMP_ARROW_LINE);
  if (!timing) return [];

  const indexFromFile = timingLineIndex > 0 && /^\d+$/.test(lines[timingLineIndex - 1]) ? Number(lines[timingLineIndex - 1]) : blockIndex + 1;
  const start = parseSrtTimestamp(timing[1]);
  const end = parseSrtTimestamp(timing[2]);
  const text = lines.slice(timingLineIndex + 1).join("\n").trim();

  return [{
    id: "",
    index: indexFromFile,
    start,
    end,
    text,
  }];
}

function createStableCueId(cue: SrtCue, position: number) {
  const start = Number.isFinite(cue.start) ? Math.round(cue.start * 1000) : "invalid";
  const end = Number.isFinite(cue.end) ? Math.round(cue.end * 1000) : "invalid";
  return `srt-cue-${position + 1}-${start}-${end}-${hashCueText(cue.text)}`;
}

function compareCueStart(a: SrtCue, b: SrtCue) {
  const aIsFinite = Number.isFinite(a.start);
  const bIsFinite = Number.isFinite(b.start);
  if (aIsFinite && bIsFinite) return a.start - b.start;
  if (aIsFinite) return -1;
  if (bIsFinite) return 1;
  return 0;
}

function isValidTimingCue(cue: SrtCue) {
  return Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end > cue.start && cue.text.trim().length > 0;
}

function hashCueText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
