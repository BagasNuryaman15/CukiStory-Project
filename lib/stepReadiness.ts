import {getRenderReadinessChecklist} from "./renderValidation";
import {validateSrtCues} from "./srt";
import type {CukiProject} from "./types";

export type EditorStep = "story" | "voice" | "scenes" | "style" | "preview";

export type StepReadinessStatus = "notStarted" | "inProgress" | "needsAttention" | "ready";

export type StepReadiness = {
  status: StepReadinessStatus;
  label: string;
};

const statusLabels: Record<StepReadinessStatus, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  needsAttention: "Needs attention",
  ready: "Ready",
};

export function getStepReadiness(project: CukiProject, step: EditorStep): StepReadiness {
  const status = getStepReadinessStatus(project, step);
  return {
    status,
    label: statusLabels[status],
  };
}

function getStepReadinessStatus(project: CukiProject, step: EditorStep): StepReadinessStatus {
  const checklist = getRenderReadinessChecklist(project);
  const item = (id: string) => checklist.find((check) => check.id === id);

  if (step === "story") {
    const story = item("story");
    if (story?.ready) return "ready";
    return hasStoryData(project) ? "inProgress" : "notStarted";
  }

  if (step === "voice") {
    const audio = item("audio");
    const srt = item("srt");
    if (audio?.ready && srt?.ready) return "ready";

    const hasAudioData = Boolean(project.audioUrl || project.audioDuration);
    const hasSrtData = Boolean(project.srtFileName || project.srtRaw?.trim() || project.srtCues?.length);
    if (!hasAudioData && (project.audioMode !== "fullVoSrt" || !hasSrtData)) return "notStarted";
    if (project.audioMode === "fullVoSrt" && hasSrtData && !validateSrtCues(project.srtCues).isValid) return "needsAttention";
    if (project.audioUrl && !audio?.ready) return "needsAttention";
    return "inProgress";
  }

  if (step === "scenes") {
    const scenes = item("scenes");
    const mapping = item("mapping");
    const images = item("images");
    if (scenes?.ready && mapping?.ready && images?.ready) return "ready";
    if (project.scenes.length === 0) return "notStarted";
    if (!mapping?.ready && project.audioMode === "fullVoSrt") return "needsAttention";
    return "inProgress";
  }

  if (step === "style") {
    return "ready";
  }

  const requiredChecks = checklist.filter((check) => check.required);
  if (requiredChecks.every((check) => check.ready)) return "ready";
  if (!hasPreviewInput(project)) return "notStarted";
  return "needsAttention";
}

function hasStoryData(project: CukiProject) {
  return Boolean(
    project.title.trim()
      || project.hook.trim()
      || project.finalVO.trim()
      || project.youtubeDescription.trim()
      || project.hashtags.trim()
      || project.notes.trim(),
  );
}

function hasPreviewInput(project: CukiProject) {
  return Boolean(project.audioUrl || project.audioDuration || project.srtCues?.length || project.scenes.length > 0);
}
