"use client";

import type {AudioMode, CukiScene, ImageEffect, SrtCue, SubtitleStyle, TransitionType} from "@/lib/types";
import {createScene} from "@/lib/storage";
import {clearSceneImageSessionMedia, storeSceneImageSessionMedia} from "@/lib/sessionMedia";
import {autoMapSrtToScenes, getAssignedSrtCueIds, getSceneStatus, getSceneVisualTimings} from "@/lib/srt";
import {createId, formatSeconds, reorderScenes} from "@/lib/utils";
import {SceneCard} from "./SceneCard";

export function SceneEditor({
  scenes,
  projectId,
  onChange,
  sceneDefaults,
  audioMode,
  srtCues = [],
}: {
  scenes: CukiScene[];
  projectId: string;
  onChange: (scenes: CukiScene[]) => void;
  sceneDefaults?: {
    subtitleStyle: SubtitleStyle;
    transition: TransitionType;
    effect: ImageEffect;
  };
  audioMode?: AudioMode;
  srtCues?: SrtCue[];
}) {
  const visualTimings = audioMode === "fullVoSrt" ? getSceneVisualTimings(scenes, srtCues) : [];
  const assignedCueIds = getAssignedSrtCueIds(scenes, srtCues);
  const readyScenes = scenes.filter((scene) => getSceneStatus(scene, srtCues, audioMode === "fullVoSrt") === "ready").length;
  const mappedScenes = scenes.filter((scene) => getSceneStatus(scene, srtCues, audioMode === "fullVoSrt") !== "empty").length;
  const visualDuration = Math.max(0, ...visualTimings.map((timing) => timing?.end ?? 0));

  function addScene() {
    onChange([...scenes, createScene(scenes.length + 1, sceneDefaults)]);
  }

  function updateScene(index: number, scene: CukiScene) {
    onChange(reorderScenes(scenes.map((item, itemIndex) => (itemIndex === index ? scene : item))));
  }

  function duplicateScene(index: number) {
    const copy = {...scenes[index], id: createId("scene"), order: index + 2};
    if (copy.imageUrl) storeSceneImageSessionMedia(projectId, copy.id, copy.imageUrl);
    onChange(reorderScenes([...scenes.slice(0, index + 1), copy, ...scenes.slice(index + 1)]));
  }

  function deleteScene(index: number) {
    clearSceneImageSessionMedia(projectId, scenes[index].id);
    onChange(reorderScenes(scenes.filter((_, itemIndex) => itemIndex !== index)));
  }

  function moveScene(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    const next = [...scenes];
    const current = next[index];
    next[index] = next[nextIndex];
    next[nextIndex] = current;
    onChange(reorderScenes(next));
  }

  function clearMapping() {
    onChange(scenes.map((scene) => ({
      ...scene,
      srtCueStartId: null,
      srtCueEndId: null,
      srtCueStartIndex: null,
      srtCueEndIndex: null,
      manualDurationOverride: false,
    })));
  }

  function autoMap() {
    onChange(reorderScenes(autoMapSrtToScenes(scenes, srtCues)));
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Scene Timeline</h2>
          <p className="text-sm text-studio-muted">Map SRT cue ranges to visual scenes, then attach one image per scene.</p>
        </div>
        <button onClick={addScene} className="btn-primary px-5 py-3">
          Add Scene
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <TimelineMetric label="Scenes" value={`${scenes.length}`} tone={scenes.length > 0 ? "ready" : "setup"} />
        <TimelineMetric label="Ready" value={`${readyScenes}/${scenes.length}`} tone={readyScenes === scenes.length && scenes.length > 0 ? "ready" : "setup"} />
        <TimelineMetric label="Mapped" value={`${mappedScenes}/${scenes.length}`} tone={mappedScenes === scenes.length && scenes.length > 0 ? "ready" : "setup"} />
        <TimelineMetric label="Visual End" value={visualDuration > 0 ? formatSeconds(visualDuration) : "Waiting"} tone={visualDuration > 0 ? "ready" : "setup"} />
      </div>

      {audioMode === "fullVoSrt" ? (
        <div className="guidance-card rounded-2xl p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-extrabold text-white">SRT Mapping</p>
              <p className="mt-1 text-sm">
                {assignedCueIds.size} of {srtCues.length} cues assigned. Subtitle timing stays global; scene images follow mapped cue ranges.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={autoMap} disabled={srtCues.length === 0 || scenes.length === 0} className="btn-secondary px-4 py-3 text-sm">
                Auto Map SRT to Scenes
              </button>
              <button onClick={clearMapping} disabled={scenes.length === 0} className="btn-quiet px-4 py-3 text-sm">
                Clear Mapping
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {scenes.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <p className="text-2xl font-extrabold text-white">No scenes yet</p>
          <p className="mt-2 text-studio-muted">Add 6-10 comic panels, then use Auto Timing to sync with the VO.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={index}
              isFirst={index === 0}
              isLast={index === scenes.length - 1}
              onChange={(nextScene) => updateScene(index, nextScene)}
              onDuplicate={() => duplicateScene(index)}
              onDelete={() => deleteScene(index)}
              onMoveUp={() => moveScene(index, -1)}
              onMoveDown={() => moveScene(index, 1)}
              projectId={projectId}
              audioMode={audioMode}
              srtCues={srtCues}
              visualTiming={visualTimings[index]}
            />
          ))}
          <div className="rounded-[1.5rem] border border-dashed border-studio-cyan/30 bg-studio-cyan/10 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-extrabold text-white">Add another scene</p>
                <p className="mt-1 text-sm text-cyan-100">Append scene {scenes.length + 1} without scrolling back to the top.</p>
              </div>
              <button onClick={addScene} className="btn-primary px-5 py-3">
                Add Scene
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TimelineMetric({label, value, tone}: {label: string; value: string; tone: "ready" | "setup"}) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === "ready" ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-white/[0.035]"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}
