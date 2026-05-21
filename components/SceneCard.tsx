"use client";

import {useEffect, useState} from "react";
import type {AudioMode, CukiScene, SrtCue} from "@/lib/types";
import {transitionDurations} from "@/lib/presets";
import {formatShortTimestamp, getSceneSrtCues, getSceneSrtTiming} from "@/lib/srt";
import {fileToDataUrl, formatSeconds} from "@/lib/utils";
import {EffectPicker} from "./EffectPicker";
import {TransitionPicker} from "./TransitionPicker";

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
  audioMode?: AudioMode;
  srtCues?: SrtCue[];
};

export function SceneCard({scene, index, isFirst, isLast, onChange, onDuplicate, onDelete, onMoveUp, onMoveDown, audioMode, srtCues = []}: SceneCardProps) {
  const isSrtMode = audioMode === "fullVoSrt";
  const srtTiming = isSrtMode ? getSceneSrtTiming(scene, srtCues) : null;
  const mappedCues = isSrtMode ? getSceneSrtCues(scene, srtCues) : [];
  const effectiveDuration = srtTiming?.duration ?? scene.duration;
  const warnings = getSceneWarnings(scene, isSrtMode, mappedCues.length > 0);

  async function handleImage(file: File | undefined) {
    if (!file) return;
    try {
      const imageUrl = await fileToDataUrl(file);
      onChange({...scene, imageUrl});
    } catch {
      alert("Image failed to load. Try png, jpg, jpeg, or webp.");
    }
  }

  function updateSrtMapping(nextStart: number | null, nextEnd: number | null) {
    const nextScene = {
      ...scene,
      srtCueStartIndex: nextStart,
      srtCueEndIndex: nextEnd,
      timingSource: nextStart != null && nextEnd != null ? "synced" as const : scene.timingSource,
    };
    const timing = getSceneSrtTiming(nextScene, srtCues);
    onChange({
      ...nextScene,
      duration: timing && !nextScene.manualDurationOverride ? timing.duration : nextScene.duration,
    });
  }

  function updateVisualTiming(nextScene: CukiScene) {
    const timing = getSceneSrtTiming(nextScene, srtCues);
    onChange({
      ...nextScene,
      duration: timing && !nextScene.manualDurationOverride ? timing.duration : nextScene.duration,
    });
  }

  return (
    <article className="glass-card rounded-[1.5rem] p-5">
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="w-full xl:w-56">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-extrabold text-white">Scene {index + 1}</p>
            <p className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-studio-muted">{formatSeconds(effectiveDuration)}</p>
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
          {isSrtMode ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <TimelineStat label="Start" value={srtTiming ? formatShortTimestamp(srtTiming.start) : "Unmapped"} />
              <TimelineStat label="End" value={srtTiming ? formatShortTimestamp(srtTiming.end) : "Unmapped"} />
              <TimelineStat label="Duration" value={formatSeconds(effectiveDuration)} />
            </div>
          ) : null}

          {isSrtMode ? (
            <MappedSrtPreview mappedCues={mappedCues} />
          ) : (
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
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-studio-muted">Scene Note</label>
            <input
              value={scene.note ?? ""}
              onChange={(event) => onChange({...scene, note: event.target.value})}
              className="studio-input mt-2 w-full rounded-2xl px-4 py-3"
              placeholder="Optional creator note for this panel..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Duration (seconds)">
              {isSrtMode ? (
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-studio-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(scene.manualDurationOverride)}
                    onChange={(event) => {
                      const nextScene = {...scene, manualDurationOverride: event.target.checked};
                      const timing = getSceneSrtTiming(nextScene, srtCues);
                      onChange({...nextScene, duration: timing?.duration ?? scene.duration, timingSource: event.target.checked ? "manual" : "synced"});
                    }}
                  />
                  Manual duration override
                </label>
              ) : null}
              <NumberInput
                value={effectiveDuration}
                min={0.1}
                step={0.1}
                disabled={isSrtMode && !scene.manualDurationOverride}
                onCommit={(duration) => onChange({...scene, duration, timingSource: "manual", manualDurationOverride: isSrtMode ? true : scene.manualDurationOverride})}
              />
              <p className="mt-2 text-xs font-bold text-studio-muted">{getTimingSourceLabel(scene, isSrtMode, Boolean(srtTiming))}</p>
            </Field>
            <Field label="Image Effect">
              <EffectPicker value={scene.effect} onChange={(effect) => onChange({...scene, effect})} />
            </Field>
            <Field label="Transition to next scene">
              <TransitionPicker value={scene.transition} onChange={(transition) => onChange({...scene, transition})} />
            </Field>
            <Field label="Transition duration">
              <select
                value={scene.transitionDuration ?? 0.25}
                onChange={(event) => onChange({...scene, transitionDuration: Number(event.target.value)})}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm"
              >
                {transitionDurations.map((duration) => (
                  <option key={duration.value} value={duration.value}>{duration.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {isSrtMode ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-extrabold text-white">SRT Mapping</p>
                  <p className="mt-1 text-sm text-studio-muted">Choose the subtitle cue range for this image scene.</p>
                </div>
                <button onClick={() => updateSrtMapping(null, null)} className="btn-quiet px-3 py-2 text-sm">
                  Clear Mapping
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Start subtitle cue">
                  <select
                    value={scene.srtCueStartIndex ?? ""}
                    onChange={(event) => updateSrtMapping(event.target.value ? Number(event.target.value) : null, scene.srtCueEndIndex ?? null)}
                    className="studio-input w-full rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Select start cue</option>
                    {srtCues.map((cue) => <option key={cue.id} value={cue.index}>{cueLabel(cue)}</option>)}
                  </select>
                </Field>
                <Field label="End subtitle cue">
                  <select
                    value={scene.srtCueEndIndex ?? ""}
                    onChange={(event) => updateSrtMapping(scene.srtCueStartIndex ?? null, event.target.value ? Number(event.target.value) : null)}
                    className="studio-input w-full rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Select end cue</option>
                    {srtCues.map((cue) => <option key={cue.id} value={cue.index}>{cueLabel(cue)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Visual start offset">
                  <NumberInput
                    value={scene.srtStartOffset ?? -0.2}
                    min={-10}
                    max={10}
                    step={0.1}
                    onCommit={(srtStartOffset) => updateVisualTiming({...scene, srtStartOffset})}
                  />
                  <p className="mt-2 text-xs text-studio-muted">Negative starts the image before the first subtitle cue.</p>
                </Field>
                <Field label="End hold">
                  <NumberInput
                    value={scene.srtEndHold ?? 0.35}
                    min={0}
                    max={10}
                    step={0.1}
                    onCommit={(srtEndHold) => updateVisualTiming({...scene, srtEndHold})}
                  />
                  <p className="mt-2 text-xs text-studio-muted">Keeps the image visible after the last mapped cue.</p>
                </Field>
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">Calculated from SRT</p>
                <p className="mt-2 text-sm font-bold text-white">
                  {srtTiming
                    ? `${formatShortTimestamp(srtTiming.start)} - ${formatShortTimestamp(srtTiming.end)} · ${formatSeconds(srtTiming.duration)}`
                    : "No SRT timing mapped yet."}
                </p>
                {srtTiming ? (
                  <p className="mt-2 text-xs text-studio-muted">
                    Cue timing: {formatShortTimestamp(srtTiming.baseStart)} - {formatShortTimestamp(srtTiming.baseEnd)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

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

function MappedSrtPreview({mappedCues}: {mappedCues: SrtCue[]}) {
  return (
    <div className={`rounded-2xl border p-4 ${mappedCues.length > 0 ? "border-studio-cyan/20 bg-studio-cyan/10" : "border-white/10 bg-white/[0.035]"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-studio-muted">Mapped SRT Preview</p>
          <p className="mt-1 text-sm text-studio-muted">These cues are the subtitles that render for this scene.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-extrabold text-cyan-100">
          {mappedCues.length} cue{mappedCues.length === 1 ? "" : "s"}
        </span>
      </div>

      {mappedCues.length > 0 ? (
        <div className="mt-4 space-y-2">
          {mappedCues.map((cue) => (
            <div key={cue.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs font-bold text-cyan-100">
                Cue {cue.index} · {formatShortTimestamp(cue.start)} - {formatShortTimestamp(cue.end)}
              </p>
              <p className="mt-1 text-sm font-bold leading-6 text-white">{cue.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-black/20 p-3 text-sm text-studio-muted">
          Map SRT cues below to control this scene timing and subtitles.
        </p>
      )}
    </div>
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

function NumberInput({
  value,
  onCommit,
  min,
  max,
  step = 0.1,
  disabled,
}: {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(formatInputValue(value));

  useEffect(() => {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.value === draft) return;
    setDraft(formatInputValue(value));
  }, [draft, value]);

  function commit() {
    if (draft.trim() === "" || draft === "-" || draft === "." || draft === "-.") {
      setDraft(formatInputValue(value));
      return;
    }

    const numericValue = Number(draft);
    if (!Number.isFinite(numericValue)) {
      setDraft(formatInputValue(value));
      return;
    }

    const clamped = Math.min(max ?? numericValue, Math.max(min ?? numericValue, numericValue));
    const rounded = Math.round(clamped * 100) / 100;
    setDraft(formatInputValue(rounded));
    onCommit(rounded);
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className="studio-input w-full rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

function formatInputValue(value: number) {
  if (!Number.isFinite(value)) return "";
  return String(Math.round(value * 100) / 100);
}

function SmallButton({children, onClick, disabled}: {children: React.ReactNode; onClick: () => void; disabled?: boolean}) {
  return (
    <button disabled={disabled} onClick={onClick} className="btn-quiet px-3 py-2 text-sm">
      {children}
    </button>
  );
}

function TimelineStat({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-white">{value}</p>
    </div>
  );
}

function getSceneWarnings(scene: CukiScene, isSrtMode: boolean, hasMappedCues: boolean) {
  const warnings: string[] = [];
  if (!scene.imageUrl) warnings.push("Add image");
  if (isSrtMode && !hasMappedCues) warnings.push("Map SRT cues");
  if (!isSrtMode && !scene.subtitle.trim()) warnings.push("Add subtitle");
  if (scene.duration < 2 && (!isSrtMode || scene.manualDurationOverride)) warnings.push("Duration is short");
  return warnings;
}

function getTimingSourceLabel(scene: CukiScene, isSrtMode: boolean, hasSrtTiming: boolean) {
  if (isSrtMode && hasSrtTiming && !scene.manualDurationOverride) return "Controlled by mapped SRT cues";
  if (isSrtMode && !hasSrtTiming) return "Map SRT cues to calculate timing";
  if (scene.timingSource === "manual") return "Manual override";
  if (scene.timingSource === "synced") return "Synced to VO duration";
  return "Estimated from subtitle";
}

function cueLabel(cue: SrtCue) {
  const text = cue.text.replace(/\s+/g, " ");
  return `${cue.index} - ${formatShortTimestamp(cue.start)} - ${text.length > 52 ? `${text.slice(0, 52)}...` : text}`;
}
