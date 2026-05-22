"use client";

import {useEffect, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import type {CukiProject} from "@/lib/types";
import {getDurationDifference, getTotalSceneDuration} from "@/lib/timing";
import {getAssignedSrtCueIndexes, getSceneSrtTiming, getSrtDuration} from "@/lib/srt";
import {downloadBlob, formatSeconds} from "@/lib/utils";

export function RenderPanel({project, onSave}: {project: CukiProject; onSave: () => void}) {
  const [isRendering, setIsRendering] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const warnings = validateForRender(project);
  const renderEstimate = useMemo(() => getRenderEstimate(project), [project]);

  useEffect(() => {
    if (!isRendering) return;
    setElapsedSeconds(0);
    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRendering]);

  async function render() {
    onSave();
    setIsRendering(true);
    setElapsedSeconds(0);
    setStatus("Preparing render bundle.");
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
        {isRendering ? "Rendering MP4..." : "Render & Download MP4"}
      </button>
      {isRendering ? <RenderOverlay elapsedSeconds={elapsedSeconds} estimateSeconds={renderEstimate} title={project.title} /> : null}
      {status ? <p className="mt-4 text-sm text-studio-muted">{status}</p> : null}
    </section>
  );
}

function RenderOverlay({elapsedSeconds, estimateSeconds, title}: {elapsedSeconds: number; estimateSeconds: number; title: string}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="render-overlay">
      <RenderActivity elapsedSeconds={elapsedSeconds} estimateSeconds={estimateSeconds} title={title} />
    </div>,
    document.body,
  );
}

function RenderActivity({elapsedSeconds, estimateSeconds, title}: {elapsedSeconds: number; estimateSeconds: number; title: string}) {
  const progress = Math.min(94, Math.max(8, Math.round((elapsedSeconds / estimateSeconds) * 86)));
  const stage = getRenderStage(progress, elapsedSeconds);

  return (
    <div className="render-activity w-full max-w-[560px] overflow-hidden rounded-[1.25rem] border border-studio-cyan/30 bg-studio-ink/95 p-6 shadow-card">
      <div className="render-corner render-corner-tl" />
      <div className="render-corner render-corner-br" />
      <div className="relative z-10">
        <div className="mx-auto render-orbit">
          <span />
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-studio-cyan">Rendering MP4</p>
          <h3 className="mt-2 truncate text-2xl font-extrabold text-white">{title || "CukiStory Video"}</h3>
          <p className="mt-2 text-sm font-bold text-cyan-100">{stage}</p>
        </div>

        <div className="render-equalizer mt-5" aria-hidden="true">
          {Array.from({length: 18}).map((_, index) => <span key={index} />)}
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-studio-muted">
            <span>Estimated progress</span>
            <span className="text-cyan-100">{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="render-progress h-full rounded-full" style={{width: `${progress}%`}} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
          <RenderMetric label="Elapsed" value={formatSeconds(elapsedSeconds)} />
          <RenderMetric label="Estimate" value={formatSeconds(estimateSeconds)} />
          <RenderMetric label="Output" value="MP4" />
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-studio-muted">
          Keep this page open. The download starts automatically when the MP4 is finished.
        </p>
      </div>
    </div>
  );
}

function RenderMetric({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="font-bold uppercase tracking-[0.16em] text-studio-muted">{label}</p>
      <p className="mt-1 font-extrabold text-white">{value}</p>
    </div>
  );
}

function getRenderStage(progress: number, elapsedSeconds: number) {
  if (elapsedSeconds < 3) return "Bundling Remotion composition";
  if (progress < 35) return "Preparing frames and media";
  if (progress < 70) return "Rendering vertical video frames";
  if (progress < 92) return "Encoding H.264 MP4";
  return "Finalizing download package";
}

function getRenderEstimate(project: CukiProject) {
  const videoDuration = project.audioDuration ?? (project.audioMode === "fullVoSrt" ? getSrtDuration(project.srtCues) : getTotalSceneDuration(project.scenes));
  const sceneWeight = Math.max(1, project.scenes.length) * 1.4;
  const durationWeight = Math.max(8, videoDuration * 1.8);
  return Math.min(240, Math.max(24, Math.round(durationWeight + sceneWeight)));
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
