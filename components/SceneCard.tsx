"use client";

import type {CukiScene} from "@/lib/types";
import {fileToDataUrl, formatSeconds} from "@/lib/utils";
import {EffectPicker} from "./EffectPicker";

type SceneCardProps = {
  scene: CukiScene;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (scene: CukiScene) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function SceneCard({scene, index, isFirst, isLast, onChange, onDuplicate, onDelete, onMoveUp, onMoveDown}: SceneCardProps) {
  const warnings = getSceneWarnings(scene);

  async function handleImage(file: File | undefined) {
    if (!file) return;
    try {
      const imageUrl = await fileToDataUrl(file);
      onChange({...scene, imageUrl});
    } catch {
      alert("Image failed to load. Try png, jpg, jpeg, or webp.");
    }
  }

  return (
    <article className="glass-card rounded-[1.5rem] p-5">
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="w-full xl:w-56">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-extrabold text-white">Scene {index + 1}</p>
            <p className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-studio-muted">{formatSeconds(scene.duration)}</p>
          </div>
          <label className="group relative flex aspect-[9/16] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02]">
            {scene.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={scene.imageUrl} alt={`Scene ${index + 1}`} className="h-full w-full object-cover transition group-hover:scale-105" />
            ) : (
              <div className="px-4 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-studio-cyan/20 bg-studio-cyan/10 text-lg font-black text-studio-cyan">+</span>
                <span className="block text-sm font-bold text-white">Upload panel</span>
                <span className="mt-1 block text-xs text-studio-muted">PNG, JPG, WEBP</span>
              </div>
            )}
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(event) => handleImage(event.target.files?.[0])} />
          </label>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-studio-muted">Subtitle</label>
            <textarea
              value={scene.subtitle}
              onChange={(event) => onChange({...scene, subtitle: event.target.value})}
              rows={4}
              className="studio-input mt-2 w-full resize-y rounded-2xl px-4 py-3"
              placeholder="Write the burned-in subtitle for this scene..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Duration (seconds)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={scene.duration}
                onChange={(event) => onChange({...scene, duration: Number(event.target.value), timingSource: "manual"})}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs font-bold text-studio-muted">{getTimingSourceLabel(scene)}</p>
            </Field>
            <Field label="Image Effect">
              <EffectPicker value={scene.effect} onChange={(effect) => onChange({...scene, effect})} />
            </Field>
          </div>

          {warnings.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {warnings.map((warning) => (
                <span key={warning} className="rounded-full border border-studio-cyan/20 bg-studio-cyan/10 px-3 py-1 text-xs font-bold text-cyan-100">{warning}</span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <SmallButton onClick={onMoveUp} disabled={isFirst}>Move Up</SmallButton>
            <SmallButton onClick={onMoveDown} disabled={isLast}>Move Down</SmallButton>
            <SmallButton onClick={onDuplicate}>Duplicate</SmallButton>
            <button onClick={onDelete} className="btn-danger px-3 py-2 text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</span>
      {children}
    </label>
  );
}

function SmallButton({children, onClick, disabled}: {children: React.ReactNode; onClick: () => void; disabled?: boolean}) {
  return (
    <button disabled={disabled} onClick={onClick} className="btn-quiet px-3 py-2 text-sm">
      {children}
    </button>
  );
}

function getSceneWarnings(scene: CukiScene) {
  const warnings: string[] = [];
  if (!scene.imageUrl) warnings.push("Add image");
  if (!scene.subtitle.trim()) warnings.push("Add subtitle");
  if (scene.duration < 2) warnings.push("Duration is short");
  return warnings;
}

function getTimingSourceLabel(scene: CukiScene) {
  if (scene.timingSource === "manual") return "Manual override";
  if (scene.timingSource === "synced") return "Synced to VO duration";
  return "Estimated from subtitle";
}
