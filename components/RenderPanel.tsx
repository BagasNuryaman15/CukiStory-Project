"use client";

import {useState} from "react";
import type {CukiProject} from "@/lib/types";
import {getDurationDifference} from "@/lib/timing";
import {getAssignedSrtCueIndexes, getSceneSrtTiming, getSrtDuration} from "@/lib/srt";
import {downloadBlob, formatSeconds} from "@/lib/utils";

export function RenderPanel({project, onSave}: {project: CukiProject; onSave: () => void}) {
  const [isRendering, setIsRendering] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const warnings = validateForRender(project);

  async function render() {
    onSave();
    setIsRendering(true);
    setStatus("Rendering MP4 locally. This can take a while.");
    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({project}),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({error: "Render failed"}));
        throw new Error(payload.error ?? "Render failed");
      }

      const blob = await response.blob();
      downloadBlob(blob, `${safeFilename(project.title)}.mp4`);
      setStatus("Render complete. MP4 download started.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Render failed.");
    } finally {
      setIsRendering(false);
    }
  }

  return (
    <section className="glass-card rounded-[1.5rem] p-5">
      <h2 className="text-2xl font-extrabold text-white">Render MP4</h2>
      <p className="mt-1 text-sm text-studio-muted">Exports a 1080x1920, 30fps MP4 with VO, subtitles, image motion, and transitions.</p>

      {warnings.length > 0 ? (
        <div className="soft-warning mt-5 rounded-2xl p-4">
          <p className="font-extrabold">Before final render</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      ) : null}

      <button
        onClick={render}
        disabled={isRendering}
        className="btn-primary mt-5 w-full px-5 py-4"
      >
        {isRendering ? "Rendering..." : "Render & Download MP4"}
      </button>
      {status ? <p className="mt-4 text-sm text-studio-muted">{status}</p> : null}
    </section>
  );
}

function validateForRender(project: CukiProject) {
  const warnings: string[] = [];
  if (!project.audioUrl) warnings.push("No VO audio uploaded yet.");
  if (project.audioUrl && !project.audioDuration) warnings.push("Load audio duration before final timing.");
  if (project.audioMode === "fullVoSrt") {
    const cues = project.srtCues ?? [];
    const srtDuration = getSrtDuration(cues);
    const assigned = getAssignedSrtCueIndexes(project.scenes);
    const assignedCueCount = cues.filter((cue) => assigned.has(cue.index)).length;
    if (cues.length === 0) warnings.push("No SRT cues parsed yet.");
    if (cues.length > 0 && assignedCueCount < cues.length) warnings.push(`${cues.length - assignedCueCount} SRT cue${cues.length - assignedCueCount === 1 ? "" : "s"} are not assigned to any scene.`);
    const unmappedScenes = project.scenes.filter((scene) => !getSceneSrtTiming(scene, cues));
    if (unmappedScenes.length > 0) warnings.push(`${unmappedScenes.length} scene${unmappedScenes.length === 1 ? "" : "s"} are not mapped to SRT cues.`);
    if (project.audioDuration && srtDuration > 0) {
      const difference = srtDuration - project.audioDuration;
      if (difference > 0.75) warnings.push(`SRT is ${formatSeconds(difference)} longer than audio.`);
      if (difference < -0.75) warnings.push(`SRT ends ${formatSeconds(Math.abs(difference))} before audio ends.`);
    }
  }
  if (project.scenes.length === 0) warnings.push("Add at least one scene.");
  project.scenes.forEach((scene, index) => {
    if (!scene.imageUrl) warnings.push(`Scene ${index + 1}: add a panel image.`);
    if (project.audioMode !== "fullVoSrt" && !scene.subtitle.trim()) warnings.push(`Scene ${index + 1}: add subtitle text.`);
    if (project.audioMode !== "fullVoSrt" && scene.duration < 2) warnings.push(`Scene ${index + 1}: duration is shorter than 2 seconds.`);
  });
  if (project.audioMode !== "fullVoSrt" && project.audioDuration && Math.abs(getDurationDifference(project)) > 0.5) {
    const difference = getDurationDifference(project);
    warnings.push(`Scene timing is ${formatSeconds(Math.abs(difference))} ${difference < 0 ? "shorter" : "longer"} than VO.`);
  }
  return warnings;
}

function safeFilename(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cukistory-video";
}
