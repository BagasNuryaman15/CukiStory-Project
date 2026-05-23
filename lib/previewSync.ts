import type {CukiProject} from "./types";
import {getAssignedSrtCueIds, getSceneStatus, getSrtDuration} from "./srt";
import {getProjectTimelineDuration, getScenePlaybackTimings, getSrtVisualDuration} from "./timing";

export type PreviewSyncItem = {
  id: string;
  label: string;
  ready: boolean;
  message: string;
};

export type PreviewSyncStatus = {
  finalDuration: number;
  audioDuration: number;
  srtDuration: number;
  visualDuration: number;
  blackTailRisk: number;
  items: PreviewSyncItem[];
};

export function getPreviewSyncStatus(project: CukiProject): PreviewSyncStatus {
  const cues = project.srtCues ?? [];
  const playbackTimings = getScenePlaybackTimings(project);
  const finalDuration = getProjectTimelineDuration(project);
  const audioDuration = project.audioDuration ?? 0;
  const srtDuration = getSrtDuration(cues);
  const visualDuration = project.audioMode === "fullVoSrt" ? getSrtVisualDuration(project.scenes, cues) : playbackTimings.at(-1)?.end ?? 0;
  const assignedCueIds = getAssignedSrtCueIds(project.scenes, cues);
  const assignedCueCount = cues.filter((cue) => assignedCueIds.has(cue.id)).length;
  const readyScenes = project.scenes.filter((scene) => getSceneStatus(scene, cues, project.audioMode === "fullVoSrt") === "ready").length;
  const blackTailRisk = Math.max(0, finalDuration - Math.max(visualDuration, playbackTimings.at(-1)?.end ?? 0));

  return {
    finalDuration,
    audioDuration,
    srtDuration,
    visualDuration,
    blackTailRisk,
    items: [
      {
        id: "audio",
        label: "Audio",
        ready: Boolean(project.audioUrl && project.audioDuration),
        message: project.audioUrl ? "VO duration loaded" : "Upload VO audio",
      },
      {
        id: "subtitles",
        label: "Subtitles",
        ready: project.audioMode !== "fullVoSrt" || cues.length > 0,
        message: project.audioMode === "fullVoSrt" ? `${cues.length} SRT cues` : "Scene subtitle fallback",
      },
      {
        id: "mapping",
        label: "Mapping",
        ready: project.audioMode !== "fullVoSrt" || (cues.length > 0 && assignedCueCount === cues.length),
        message: project.audioMode === "fullVoSrt" ? `${assignedCueCount}/${cues.length} cues assigned` : "Sequential scenes",
      },
      {
        id: "images",
        label: "Images",
        ready: project.scenes.length > 0 && readyScenes === project.scenes.length,
        message: `${readyScenes}/${project.scenes.length} scenes ready`,
      },
      {
        id: "duration",
        label: "Duration",
        ready: finalDuration > 0,
        message: finalDuration > 0 ? "Final duration calculated" : "Waiting for timeline",
      },
    ],
  };
}
