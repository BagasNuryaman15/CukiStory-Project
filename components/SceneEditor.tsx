"use client";

import type {CukiScene, SubtitleStyle, TransitionType} from "@/lib/types";
import {createScene} from "@/lib/storage";
import {createId, reorderScenes} from "@/lib/utils";
import {SceneCard} from "./SceneCard";

export function SceneEditor({
  scenes,
  onChange,
  sceneDefaults,
}: {
  scenes: CukiScene[];
  onChange: (scenes: CukiScene[]) => void;
  sceneDefaults?: {
    subtitleStyle: SubtitleStyle;
    transition: TransitionType;
  };
}) {
  function addScene() {
    onChange([...scenes, createScene(scenes.length + 1, sceneDefaults)]);
  }

  function updateScene(index: number, scene: CukiScene) {
    onChange(reorderScenes(scenes.map((item, itemIndex) => (itemIndex === index ? scene : item))));
  }

  function duplicateScene(index: number) {
    const copy = {...scenes[index], id: createId("scene"), order: index + 2};
    onChange(reorderScenes([...scenes.slice(0, index + 1), copy, ...scenes.slice(index + 1)]));
  }

  function deleteScene(index: number) {
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

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Scenes</h2>
          <p className="text-sm text-studio-muted">Add one uploaded image and subtitle per storyboard panel.</p>
        </div>
        <button onClick={addScene} className="btn-primary px-5 py-3">
          Add Scene
        </button>
      </div>

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
            />
          ))}
        </div>
      )}
    </section>
  );
}
