"use client";

import {Player} from "@remotion/player";
import type {CukiProject} from "@/lib/types";
import {getPreviewSyncStatus} from "@/lib/previewSync";
import {getScenePlaybackTimings} from "@/lib/timing";
import {formatShortTimestamp} from "@/lib/srt";
import {formatSeconds} from "@/lib/utils";
import {CukiStoryComposition, getProjectDurationInFrames} from "@/remotion/CukiStoryComposition";

export function VideoPreview({project}: {project: CukiProject}) {
  const durationInFrames = getProjectDurationInFrames(project);
  const syncStatus = getPreviewSyncStatus(project);
  const playbackTimings = getScenePlaybackTimings(project);

  return (
    <section className="glass-card rounded-[1.5rem] p-5">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Preview</h2>
            <p className="mt-1 text-sm text-studio-muted">Final 9:16 vertical frame using render timing.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-studio-muted">
            1080x1920
          </span>
        </div>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <PreviewMetric label="Final" value={formatSeconds(syncStatus.finalDuration)} />
        <PreviewMetric label="Visual" value={formatSeconds(syncStatus.visualDuration)} />
      </div>
      <div className="mx-auto max-w-[390px] rounded-[2.25rem] border border-white/10 bg-black/70 p-3 shadow-card">
        <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-white/20" />
        <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-black">
          <Player
            component={CukiStoryComposition}
            inputProps={{project}}
            durationInFrames={durationInFrames}
            compositionWidth={project.width}
            compositionHeight={project.height}
            fps={project.fps}
            controls
            style={{width: "100%", aspectRatio: "9 / 16"}}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {syncStatus.items.slice(0, 4).map((item) => (
            <ReadinessPill key={item.id} ready={item.ready} label={item.message} />
          ))}
        </div>
      </div>
      <PreviewSyncPanel project={project} syncStatus={syncStatus} playbackTimings={playbackTimings} />
    </section>
  );
}

function PreviewSyncPanel({
  project,
  syncStatus,
  playbackTimings,
}: {
  project: CukiProject;
  syncStatus: ReturnType<typeof getPreviewSyncStatus>;
  playbackTimings: ReturnType<typeof getScenePlaybackTimings>;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">Preview Sync</p>
          <p className="mt-1 text-sm font-bold text-white">{project.audioMode === "fullVoSrt" ? "SRT-driven timing" : "Sequential timing"}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-extrabold text-cyan-100">
          {formatSeconds(syncStatus.finalDuration)}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {syncStatus.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-studio-muted">{item.label}</span>
            <span className={item.ready ? "text-xs font-bold text-emerald-200" : "text-xs font-bold text-cyan-100"}>{item.message}</span>
          </div>
        ))}
      </div>

      {playbackTimings.length > 0 ? (
        <div className="mt-4 max-h-56 space-y-2 overflow-auto pr-1">
          {playbackTimings.slice(0, 12).map((timing) => (
            <div key={timing.scene.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-extrabold text-white">{timing.scene.title || `Scene ${timing.index + 1}`}</p>
                <span className="shrink-0 text-xs font-bold text-cyan-100">
                  {formatShortTimestamp(timing.start)} - {formatShortTimestamp(timing.end)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-studio-cyan to-studio-blue"
                  style={{width: `${Math.max(2, Math.min(100, (timing.duration / Math.max(0.1, syncStatus.finalDuration)) * 100))}%`}}
                />
              </div>
            </div>
          ))}
          {playbackTimings.length > 12 ? <p className="px-2 text-xs text-studio-muted">Showing first 12 scenes.</p> : null}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-black/20 p-3 text-sm text-studio-muted">
          Add scenes to see the visual timing map.
        </p>
      )}
    </div>
  );
}

function PreviewMetric({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function ReadinessPill({ready, label}: {ready: boolean; label: string}) {
  return (
    <span className={`rounded-full px-3 py-2 text-center font-bold ${ready ? "bg-emerald-400/15 text-emerald-200" : "bg-studio-cyan/10 text-cyan-100"}`}>
      {label}
    </span>
  );
}
