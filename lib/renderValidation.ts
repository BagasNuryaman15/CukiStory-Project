import type {CukiProject} from "./types";
import {getDurationDifference, getProjectTimelineDuration} from "./timing";
import {analyzeSrtMappings, getSrtDuration, validateSrtCues} from "./srt";
import {formatSeconds} from "./utils";

export type RenderValidation = {
  errors: string[];
  warnings: string[];
  checklist: RenderReadinessItem[];
};

export type RenderReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  required: boolean;
  message: string;
};

export function validateForRender(project: CukiProject): RenderValidation {
  const checklist = getRenderReadinessChecklist(project);
  const errors: string[] = [];
  const warnings: string[] = [];
  checklist.forEach((item) => {
    if (item.ready) return;
    if (item.required) errors.push(item.message);
    else warnings.push(item.message);
  });

  if (project.audioMode === "fullVoSrt") {
    const cues = project.srtCues ?? [];
    const mappingValidation = analyzeSrtMappings(project.scenes, cues);
    warnings.push(...mappingValidation.warnings);
    const srtDuration = getSrtDuration(cues);
    if (project.audioDuration && srtDuration > 0) {
      const difference = srtDuration - project.audioDuration;
      if (difference > 0.75) warnings.push(`SRT is ${formatSeconds(difference)} longer than audio.`);
      if (difference < -0.75) warnings.push(`SRT ends ${formatSeconds(Math.abs(difference))} before audio ends.`);
    }
  }
  if (project.audioMode !== "fullVoSrt") {
    project.scenes.forEach((scene, index) => {
      if (!scene.subtitle.trim()) errors.push(`Scene ${index + 1}: add subtitle text.`);
    });
  }
  project.scenes.forEach((scene, index) => {
    if (project.audioMode !== "fullVoSrt" && scene.duration < 2) warnings.push(`Scene ${index + 1}: duration is shorter than 2 seconds.`);
  });
  if (project.audioMode !== "fullVoSrt" && project.audioDuration && Math.abs(getDurationDifference(project)) > 0.5) {
    const difference = getDurationDifference(project);
    warnings.push(`Scene timing is ${formatSeconds(Math.abs(difference))} ${difference < 0 ? "shorter" : "longer"} than VO.`);
  }
  return {errors: uniqueMessages(errors), warnings: uniqueMessages(warnings), checklist};
}

export function getRenderReadinessChecklist(project: CukiProject): RenderReadinessItem[] {
  const cues = project.srtCues ?? [];
  const srtValidation = validateSrtCues(cues);
  const mappingValidation = analyzeSrtMappings(project.scenes, cues);
  const missingImageIndexes = project.scenes
    .map((scene, index) => (!scene.imageUrl ? index + 1 : null))
    .filter((index): index is number => index !== null);
  const finalDuration = getProjectTimelineDuration(project);
  const hasCompleteStoryPackage = Boolean(project.finalVO.trim() && project.title.trim() && project.hook.trim());

  return [
    {
      id: "story",
      label: "Story package",
      ready: hasCompleteStoryPackage,
      required: false,
      message: getStoryPackageMessage(project),
    },
    {
      id: "audio",
      label: "Audio uploaded",
      ready: Boolean(project.audioUrl && project.audioDuration),
      required: true,
      message: project.audioUrl ? "Load audio duration before final timing." : "Upload a VO audio file.",
    },
    {
      id: "srt",
      label: "SRT valid",
      ready: project.audioMode !== "fullVoSrt" || srtValidation.isValid,
      required: project.audioMode === "fullVoSrt",
      message: srtValidation.errors[0]?.message ?? "Upload and parse a valid SRT file.",
    },
    {
      id: "scenes",
      label: "Scenes created",
      ready: project.scenes.length > 0,
      required: true,
      message: "Add at least one scene.",
    },
    {
      id: "mapping",
      label: "Scenes mapped",
      ready: project.audioMode !== "fullVoSrt" || (project.scenes.length > 0 && mappingValidation.errors.length === 0),
      required: project.audioMode === "fullVoSrt",
      message: mappingValidation.errors[0] ?? getMappingMessage(cues.length, mappingValidation.assignedCueCount, mappingValidation.unmappedSceneCount),
    },
    {
      id: "images",
      label: "Images complete",
      ready: project.scenes.length > 0 && missingImageIndexes.length === 0,
      required: true,
      message: getImagesMessage(missingImageIndexes),
    },
    {
      id: "duration",
      label: "Duration valid",
      ready: Number.isFinite(finalDuration) && finalDuration > 0,
      required: true,
      message: "Fix project duration before rendering.",
    },
    {
      id: "preview",
      label: "Preview checked",
      ready: true,
      required: false,
      message: "Preview the video once before final export.",
    },
  ];
}

function getMappingMessage(cueCount: number, assignedCueCount: number, unmappedScenes: number) {
  if (unmappedScenes > 0) return `Map ${unmappedScenes} scene${unmappedScenes === 1 ? "" : "s"} to SRT cues.`;
  if (cueCount > 0 && assignedCueCount < cueCount) {
    const remaining = cueCount - assignedCueCount;
    return `Assign ${remaining} remaining SRT cue${remaining === 1 ? "" : "s"} to scenes.`;
  }
  return "Map SRT cues to scenes.";
}

function getImagesMessage(missingImageIndexes: number[]) {
  if (missingImageIndexes.length === 1) return `Scene ${missingImageIndexes[0]}: add a panel image.`;
  if (missingImageIndexes.length > 1) return `Add panel images to scenes ${missingImageIndexes.join(", ")}.`;
  return "Add panel images to every scene.";
}

function getStoryPackageMessage(project: CukiProject) {
  const missingFinalVo = !project.finalVO.trim();
  const missingTitleOrHook = !project.title.trim() || !project.hook.trim();

  if (missingFinalVo && missingTitleOrHook) {
    return "Story Package is incomplete. This will not block MP4 render, but export metadata may be incomplete.";
  }
  if (missingFinalVo) {
    return "Final VO text is missing from Story Package. MP4 render can continue, but Project Pack may be less complete.";
  }
  if (missingTitleOrHook) {
    return "Title or hook is missing. MP4 render can continue, but upload metadata may be incomplete.";
  }
  return "Story Package is complete.";
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages)];
}
