"use client";

import type {CukiProject} from "@/lib/types";
import {getDurationDifference, getTotalSceneDuration} from "@/lib/timing";
import {getAssignedSrtCueIndexes, getSceneVisualTimings, getSrtDuration} from "@/lib/srt";
import {formatSeconds} from "@/lib/utils";

export function DurationSummary({project}: {project: CukiProject}) {
  if (project.audioMode === "fullVoSrt") {
    const cues = project.srtCues ?? [];
    const srtDuration = getSrtDuration(cues);
    const visualTimings = getSceneVisualTimings(project.scenes, cues);
    const visualDuration = Math.max(0, ...visualTimings.map((timing) => timing?.end ?? 0));
    const assignedCueIndexes = getAssignedSrtCueIndexes(project.scenes);
    const assignedCount = cues.filter((cue) => assignedCueIndexes.has(cue.index)).length;
    const unassignedCount = Math.max(0, cues.length - assignedCount);
    const audioSrtDiff = project.audioDuration && srtDuration ? srtDuration - project.audioDuration : 0;

    return (
      <div className="grid gap-3 sm:grid-cols-4">
        <Panel label="Audio Duration" value={project.audioDuration ? formatSeconds(project.audioDuration) : "Add audio"} tone={!project.audioDuration ? "guide" : "normal"} />
        <Panel label="SRT Duration" value={srtDuration ? formatSeconds(srtDuration) : "Add SRT"} tone={!srtDuration ? "guide" : Math.abs(audioSrtDiff) > 0.75 ? "warn" : "normal"} />
        <Panel label="Visual Duration" value={formatSeconds(visualDuration)} tone="normal" />
        <Panel label="Unassigned Cues" value={`${unassignedCount}`} tone={unassignedCount > 0 ? "warn" : "normal"} />
      </div>
    );
  }

  const total = getTotalSceneDuration(project.scenes);
  const diff = getDurationDifference(project);
  const mismatch = project.audioDuration !== null && Math.abs(diff) > 0.5;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Panel label="VO Duration" value={project.audioDuration ? formatSeconds(project.audioDuration) : "Add audio"} tone={!project.audioDuration ? "guide" : "normal"} />
      <Panel label="Scene Duration" value={formatSeconds(total)} tone="normal" />
      <Panel label="Difference" value={project.audioDuration ? `${diff >= 0 ? "+" : ""}${formatSeconds(diff)}` : "Waiting"} tone={mismatch ? "warn" : "normal"} />
    </div>
  );
}

function Panel({label, value, tone}: {label: string; value: string; tone: "normal" | "warn" | "guide"}) {
  const toneClass = {
    normal: "border-white/10 bg-white/[0.04]",
    warn: "soft-warning",
    guide: "guidance-card",
  }[tone];

  return (
    <div className={`rounded-2xl p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-studio-muted">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
    </div>
  );
}
