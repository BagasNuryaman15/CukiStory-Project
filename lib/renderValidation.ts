import type {CukiProject} from "./types";
import {getDurationDifference} from "./timing";
import {getAssignedSrtCueIds, getSceneSrtTiming, getSrtDuration} from "./srt";
import {formatSeconds} from "./utils";

export type RenderValidation = {
  errors: string[];
  warnings: string[];
};

export function validateForRender(project: CukiProject): RenderValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!project.audioUrl) errors.push("Upload a VO audio file.");
  if (project.audioUrl && !project.audioDuration) errors.push("Load audio duration before final timing.");
  if (project.audioMode === "fullVoSrt") {
    const cues = project.srtCues ?? [];
    const srtDuration = getSrtDuration(cues);
    const assigned = getAssignedSrtCueIds(project.scenes, cues);
    const assignedCueCount = cues.filter((cue) => assigned.has(cue.id)).length;
    if (cues.length === 0) errors.push("Upload and parse an SRT file.");
    if (cues.length > 0 && assignedCueCount < cues.length) errors.push(`Assign ${cues.length - assignedCueCount} remaining SRT cue${cues.length - assignedCueCount === 1 ? "" : "s"} to scenes.`);
    const unmappedScenes = project.scenes.filter((scene) => !getSceneSrtTiming(scene, cues));
    if (unmappedScenes.length > 0) errors.push(`Map ${unmappedScenes.length} scene${unmappedScenes.length === 1 ? "" : "s"} to SRT cues.`);
    if (project.audioDuration && srtDuration > 0) {
      const difference = srtDuration - project.audioDuration;
      if (difference > 0.75) warnings.push(`SRT is ${formatSeconds(difference)} longer than audio.`);
      if (difference < -0.75) warnings.push(`SRT ends ${formatSeconds(Math.abs(difference))} before audio ends.`);
    }
  }
  if (project.scenes.length === 0) errors.push("Add at least one scene.");
  project.scenes.forEach((scene, index) => {
    if (!scene.imageUrl) errors.push(`Scene ${index + 1}: add a panel image.`);
    if (project.audioMode !== "fullVoSrt" && !scene.subtitle.trim()) errors.push(`Scene ${index + 1}: add subtitle text.`);
    if (project.audioMode !== "fullVoSrt" && scene.duration < 2) warnings.push(`Scene ${index + 1}: duration is shorter than 2 seconds.`);
  });
  if (project.audioMode !== "fullVoSrt" && project.audioDuration && Math.abs(getDurationDifference(project)) > 0.5) {
    const difference = getDurationDifference(project);
    warnings.push(`Scene timing is ${formatSeconds(Math.abs(difference))} ${difference < 0 ? "shorter" : "longer"} than VO.`);
  }
  return {errors, warnings};
}
