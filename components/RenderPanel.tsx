"use client";

import {useState} from "react";
import type {CukiProject} from "@/lib/types";
import {getDurationDifference} from "@/lib/timing";
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
  if (!project.audioUrl) warnings.push("Add VO audio so the export includes narration.");
  if (!project.audioDuration) warnings.push("Load audio duration before final timing.");
  if (project.scenes.length === 0) warnings.push("Add at least one scene.");
  project.scenes.forEach((scene, index) => {
    if (!scene.imageUrl) warnings.push(`Scene ${index + 1}: add a panel image.`);
    if (!scene.subtitle.trim()) warnings.push(`Scene ${index + 1}: add subtitle text.`);
    if (scene.duration < 1) warnings.push(`Scene ${index + 1}: set duration to at least 1 second.`);
  });
  if (project.audioDuration && Math.abs(getDurationDifference(project)) > 0.5) {
    const difference = getDurationDifference(project);
    warnings.push(`Scene timing is ${formatSeconds(Math.abs(difference))} ${difference < 0 ? "shorter" : "longer"} than VO.`);
  }
  return warnings;
}

function safeFilename(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cukistory-video";
}
