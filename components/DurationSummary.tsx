"use client";

import type {CukiProject} from "@/lib/types";
import {getDurationDifference, getTotalSceneDuration} from "@/lib/timing";
import {formatSeconds} from "@/lib/utils";

export function DurationSummary({project}: {project: CukiProject}) {
  const total = getTotalSceneDuration(project.scenes);
  const diff = getDurationDifference(project);
  const mismatch = project.audioDuration !== null && Math.abs(diff) > 0.25;

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
