import type {CukiProject} from "./types";
import {formatTimestamp, getSceneSrtCues, getSceneSrtTiming, getSceneStatus, getSceneVoSegment} from "./srt";
import {getProjectTimelineDuration} from "./timing";
import {formatSeconds} from "./utils";

export type ExportPackFile = {
  filename: string;
  content: string;
  type: string;
};

export function createProjectExportPack(project: CukiProject): ExportPackFile[] {
  const baseName = safeFilename(project.title);
  const files: ExportPackFile[] = [
    {
      filename: `${baseName}-final_vo.txt`,
      content: project.finalVO.trim() || "(Final VO is empty)",
      type: "text/plain;charset=utf-8",
    },
    {
      filename: `${baseName}-youtube_metadata.txt`,
      content: createYoutubeMetadata(project),
      type: "text/plain;charset=utf-8",
    },
    {
      filename: `${baseName}-scene_timeline.md`,
      content: createSceneTimeline(project),
      type: "text/markdown;charset=utf-8",
    },
    {
      filename: `${baseName}-project_data.json`,
      content: JSON.stringify(createPortableProjectData(project), null, 2),
      type: "application/json;charset=utf-8",
    },
  ];

  const srtContent = getSrtExportContent(project);
  if (srtContent) {
    files.push({
      filename: `${baseName}-subtitles.srt`,
      content: srtContent,
      type: "application/x-subrip;charset=utf-8",
    });
  }

  return files;
}

function createYoutubeMetadata(project: CukiProject) {
  return [
    `Title: ${project.title}`,
    "",
    "Hook:",
    project.hook.trim() || "-",
    "",
    "Tagline:",
    project.tagline.trim() || "-",
    "",
    "Description:",
    project.youtubeDescription.trim() || "-",
    "",
    "Hashtags:",
    project.hashtags.trim() || "-",
    "",
    "Notes:",
    project.notes.trim() || "-",
  ].join("\n");
}

function createSceneTimeline(project: CukiProject) {
  const cues = project.srtCues ?? [];
  const lines = [
    `# ${project.title} - Scene Timeline`,
    "",
    `Final duration: ${formatSeconds(getProjectTimelineDuration(project))}`,
    `Audio mode: ${project.audioMode}`,
    `SRT file: ${project.srtFileName || "-"}`,
    "",
  ];

  project.scenes.forEach((scene, index) => {
    const timing = getSceneSrtTiming(scene, cues);
    const sceneCues = getSceneSrtCues(scene, cues);
    const status = getSceneStatus(scene, cues, project.audioMode === "fullVoSrt");
    const imageName = `scene-${String(index + 1).padStart(2, "0")}`;

    lines.push(`## Scene ${index + 1}${scene.title ? ` - ${scene.title}` : ""}`);
    lines.push("");
    lines.push(`Status: ${status}`);
    lines.push(`Image: ${scene.imageUrl ? imageName : "missing"}`);
    lines.push(`Timing: ${timing ? `${formatTimestamp(timing.start)} --> ${formatTimestamp(timing.end)}` : "unmapped"}`);
    lines.push(`Duration: ${timing ? formatSeconds(timing.duration) : formatSeconds(scene.duration)}`);
    lines.push(`Cue range: ${sceneCues.length > 0 ? `${sceneCues[0].index} - ${sceneCues[sceneCues.length - 1].index}` : "-"}`);
    lines.push("");
    lines.push("VO segment:");
    lines.push(getSceneVoSegment(scene, cues) || scene.subtitle || "-");
    lines.push("");
    lines.push("Visual notes:");
    lines.push(scene.visualNotes || scene.note || "-");
    lines.push("");
    lines.push("SFX notes:");
    lines.push(scene.sfxNotes || "-");
    lines.push("");
  });

  return lines.join("\n");
}

function createPortableProjectData(project: CukiProject) {
  return {
    ...project,
    audioUrl: project.audioUrl ? "[session-only audio omitted]" : null,
    scenes: project.scenes.map((scene, index) => ({
      ...scene,
      imageUrl: scene.imageUrl ? `[session-only image omitted: scene-${String(index + 1).padStart(2, "0")}]` : null,
    })),
    exportNote: "Large image/audio data URLs are session-only and omitted from this backup. Re-attach assets in CukiStory if needed.",
  };
}

function getSrtExportContent(project: CukiProject) {
  if (project.srtRaw?.trim()) return project.srtRaw.trim();
  const cues = project.srtCues ?? [];
  if (cues.length === 0) return "";

  return cues.map((cue, index) => [
    String(index + 1),
    `${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}`,
    cue.text,
  ].join("\n")).join("\n\n");
}

function safeFilename(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cukistory-project";
}
