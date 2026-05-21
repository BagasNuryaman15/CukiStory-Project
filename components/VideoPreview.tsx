"use client";

import {Player} from "@remotion/player";
import type {CukiProject} from "@/lib/types";
import {CukiStoryComposition, getProjectDurationInFrames} from "@/remotion/CukiStoryComposition";

export function VideoPreview({project}: {project: CukiProject}) {
  const durationInFrames = getProjectDurationInFrames(project);
  const hasImages = project.scenes.some((scene) => scene.imageUrl);
  const hasAudio = Boolean(project.audioUrl);

  return (
    <section className="glass-card rounded-[1.5rem] p-5">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Preview</h2>
            <p className="mt-1 text-sm text-studio-muted">Final 9:16 vertical frame.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-studio-muted">
            1080x1920
          </span>
        </div>
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
          <ReadinessPill ready={hasImages} label={hasImages ? "Panels ready" : "Add panels"} />
          <ReadinessPill ready={hasAudio} label={hasAudio ? "VO loaded" : "Add VO"} />
        </div>
      </div>
    </section>
  );
}

function ReadinessPill({ready, label}: {ready: boolean; label: string}) {
  return (
    <span className={`rounded-full px-3 py-2 text-center font-bold ${ready ? "bg-emerald-400/15 text-emerald-200" : "bg-studio-cyan/10 text-cyan-100"}`}>
      {label}
    </span>
  );
}
