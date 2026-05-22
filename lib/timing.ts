import type {CukiProject, CukiScene, TimingSource} from "./types";
import {getSceneVisualTimings, getSrtDuration} from "./srt";

export const DEFAULT_WPM = 150;
export const MIN_SCENE_DURATION = 2;
export const COMMA_PAUSE = 0.15;
export const SENTENCE_PAUSE = 0.3;
export const ELLIPSIS_PAUSE = 0.4;

const ENDING_HOLD_SECONDS = 0.5;

export function getTotalSceneDuration(scenes: CukiScene[]) {
  return scenes.reduce((total, scene) => total + (Number.isFinite(scene.duration) ? scene.duration : 0), 0);
}

export function getSrtVisualDuration(scenes: CukiScene[], cues: CukiProject["srtCues"]) {
  const visualTimings = getSceneVisualTimings(scenes, cues);
  return Math.max(0, ...visualTimings.map((timing) => timing?.end ?? 0));
}

export function getProjectTimelineDuration(project: Pick<CukiProject, "audioMode" | "audioDuration" | "srtCues" | "scenes">) {
  if (project.audioMode === "fullVoSrt") {
    return Math.max(project.audioDuration ?? 0, getSrtDuration(project.srtCues), getSrtVisualDuration(project.scenes, project.srtCues));
  }

  return getTotalSceneDuration(project.scenes);
}

export function getDurationDifference(project: Pick<CukiProject, "scenes" | "audioDuration">) {
  return getTotalSceneDuration(project.scenes) - (project.audioDuration ?? 0);
}

export function autoDistributeDurations(scenes: CukiScene[], audioDuration: number | null): CukiScene[] {
  if (scenes.length === 0) return scenes;

  const estimates = scenes.map((scene, index) => estimateSceneDuration(scene.subtitle, index === scenes.length - 1));
  const target = audioDuration && audioDuration > 0 ? audioDuration : estimates.reduce((sum, duration) => sum + duration, 0);
  const durations = fitDurationsToTarget(estimates, target);
  const timingSource: TimingSource = audioDuration && audioDuration > 0 ? "synced" : "estimated";

  return scenes.map((scene, index) => ({
    ...scene,
    duration: durations[index],
    timingSource,
  }));
}

export function normalizeDurations(scenes: CukiScene[], audioDuration: number | null): CukiScene[] {
  if (scenes.length === 0) return scenes;
  if (!audioDuration || audioDuration <= 0) return autoDistributeDurations(scenes, null);

  const total = getTotalSceneDuration(scenes);
  if (total <= 0) return autoDistributeDurations(scenes, audioDuration);

  const durations = fitDurationsToTarget(scenes.map((scene) => Math.max(0.1, scene.duration)), audioDuration);
  return scenes.map((scene, index) => ({
    ...scene,
    duration: durations[index],
    timingSource: "synced",
  }));
}

function roundToHundredths(value: number) {
  return Math.round(value * 100) / 100;
}

function estimateSceneDuration(subtitle: string, isLastScene: boolean) {
  const cleanText = subtitle.trim();
  if (!cleanText) return MIN_SCENE_DURATION + (isLastScene ? ENDING_HOLD_SECONDS : 0);

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const characterCount = cleanText.replace(/\s+/g, "").length;
  const secondsPerWord = 60 / DEFAULT_WPM;
  const punctuationPause = getPunctuationPause(cleanText);
  const longTextBreathingRoom = Math.max(0, characterCount - wordCount * 6) * 0.01;
  const endingHold = isLastScene ? ENDING_HOLD_SECONDS : 0;

  return Math.max(MIN_SCENE_DURATION, wordCount * secondsPerWord + punctuationPause + longTextBreathingRoom) + endingHold;
}

function getPunctuationPause(text: string) {
  const ellipsisCount = (text.match(/\.{3}|…/gu) ?? []).length;
  const withoutEllipsis = text.replace(/\.{3}|…/gu, "");
  const commaCount = (withoutEllipsis.match(/,/g) ?? []).length;
  const sentenceCount = (withoutEllipsis.match(/[.!?]/g) ?? []).length;

  return ellipsisCount * ELLIPSIS_PAUSE + commaCount * COMMA_PAUSE + sentenceCount * SENTENCE_PAUSE;
}

function fitDurationsToTarget(estimates: number[], target: number) {
  if (estimates.length === 0) return [];

  const minimumTotal = estimates.length * MIN_SCENE_DURATION;
  if (target <= minimumTotal) {
    const compressed = estimates.map(() => roundToHundredths(target / estimates.length));
    return fixRounding(compressed, target, 0.1);
  }

  const flexibleDurations = estimates.map((duration) => Math.max(0, duration - MIN_SCENE_DURATION));
  const flexibleTotal = flexibleDurations.reduce((sum, duration) => sum + duration, 0);
  const remaining = target - minimumTotal;

  const durations = estimates.map((estimate, index) => {
    const weight = flexibleTotal > 0 ? flexibleDurations[index] / flexibleTotal : estimate / estimates.reduce((sum, duration) => sum + duration, 0);
    return roundToHundredths(MIN_SCENE_DURATION + remaining * weight);
  });

  return fixRounding(durations, target, MIN_SCENE_DURATION);
}

function fixRounding(durations: number[], target: number, minimum: number) {
  const nextDurations = [...durations];
  let difference = roundToHundredths(target - nextDurations.reduce((sum, duration) => sum + duration, 0));

  for (let index = nextDurations.length - 1; index >= 0 && difference !== 0; index -= 1) {
    if (difference > 0) {
      nextDurations[index] = roundToHundredths(nextDurations[index] + difference);
      difference = 0;
      break;
    }

    const removable = roundToHundredths(nextDurations[index] - minimum);
    const adjustment = Math.max(difference, -removable);
    nextDurations[index] = roundToHundredths(nextDurations[index] + adjustment);
    difference = roundToHundredths(difference - adjustment);
  }

  return nextDurations.map((duration) => roundToHundredths(Math.max(0.1, duration)));
}
