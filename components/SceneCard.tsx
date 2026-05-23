"use client";

import {useEffect, useState} from "react";
import type {AudioMode, CukiScene, SrtCue} from "@/lib/types";
import {transitionDurations} from "@/lib/presets";
import {formatShortTimestamp, getSceneSrtCueRange, getSceneSrtCues, getSceneSrtTiming, getSceneStatus, getSceneVoSegment} from "@/lib/srt";
import type {SceneVisualTiming} from "@/lib/srt";
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
  visualTiming?: SceneVisualTiming | null;
};

export function SceneCard({scene, index, isFirst, isLast, onChange, onDuplicate, onDelete, onMoveUp, onMoveDown, audioMode, srtCues = [], visualTiming}: SceneCardProps) {
  const isSrtMode = audioMode === "fullVoSrt";
  const srtTiming = isSrtMode ? visualTiming ?? getSceneSrtTiming(scene, srtCues) : null;
  const mappedCues = isSrtMode ? getSceneSrtCues(scene, srtCues) : [];
  const mappedCueRange = isSrtMode ? getSceneSrtCueRange(scene, srtCues) : null;
  const selectedStartCueId = getSelectedCueId(scene.srtCueStartId, srtCues, mappedCueRange?.cues[0]?.id);
  const selectedEndCueId = getSelectedCueId(scene.srtCueEndId, srtCues, mappedCueRange?.cues[mappedCueRange.cues.length - 1]?.id);
  const effectiveDuration = srtTiming?.duration ?? scene.duration;
  const shiftedByPrevious = getShiftedByPrevious(srtTiming);
  const warnings = getSceneWarnings(scene, isSrtMode, mappedCues.length > 0);
  const sceneStatus = getSceneStatus(scene, srtCues, isSrtMode);
  const voSegment = isSrtMode ? getSceneVoSegment(scene, srtCues) : scene.subtitle;

  async function handleImage(file: File | undefined) {
    if (!file) return;
    try {
      const imageUrl = await fileToDataUrl(file);
      onChange({...scene, imageUrl});
    } catch {
      alert("Image failed to load. Try png, jpg, jpeg, or webp.");
    }
  }

  function updateSrtMapping(nextStartId: string | null, nextEndId: string | null) {
    const startCue = nextStartId ? srtCues.find((cue) => cue.id === nextStartId) : null;
    const endCue = nextEndId ? srtCues.find((cue) => cue.id === nextEndId) : null;
    const nextScene = {
      ...scene,
      srtCueStartId: nextStartId,
      srtCueEndId: nextEndId,
      srtCueStartIndex: startCue?.index ?? null,
      srtCueEndIndex: endCue?.index ?? null,
      timingSource: nextStartId != null && nextEndId != null ? "synced" as const : scene.timingSource,
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
      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-studio-cyan/20 bg-studio-cyan/10 text-sm font-black text-studio-cyan">
            {index + 1}
          </span>
          <input
            value={scene.title ?? ""}
            onChange={(event) => onChange({...scene, title: event.target.value})}
            className="min-w-0 flex-1 bg-transparent text-xl font-extrabold text-white outline-none placeholder:text-studio-muted"
            placeholder={`Scene ${index + 1} title`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SceneStatusPill status={sceneStatus} />
          <p className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-studio-muted">{formatSeconds(effectiveDuration)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="w-full xl:w-56">
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
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => onChange({...scene, imageUrl: null})} disabled={!scene.imageUrl} className="btn-quiet px-3 py-2 text-sm">
              Remove Image
            </button>
            <button onClick={() => document.getElementById(`scene-image-${scene.id}`)?.click()} className="btn-secondary px-3 py-2 text-sm">
              Replace
            </button>
          </div>
          <input id={`scene-image-${scene.id}`} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(event) => handleImage(event.target.files?.[0])} />
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
            <MappedSrtPreview mappedCues={mappedCues} voSegment={voSegment} />
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

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Visual Notes">
              <textarea
                value={scene.visualNotes ?? scene.note ?? ""}
                onChange={(event) => onChange({...scene, visualNotes: event.target.value, note: event.target.value})}
                rows={3}
                className="studio-input w-full resize-y rounded-xl px-4 py-3 text-sm"
                placeholder="Visual direction, image prompt backup, regeneration notes..."
              />
            </Field>
            <Field label="SFX Notes">
              <textarea
                value={scene.sfxNotes ?? ""}
                onChange={(event) => onChange({...scene, sfxNotes: event.target.value})}
                rows={3}
                className="studio-input w-full resize-y rounded-xl px-4 py-3 text-sm"
                placeholder="Optional sound effect or finishing notes..."
              />
            </Field>
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
            <Field label={isLast ? "Transition to next scene (none)" : "Transition to next scene"}>
              <TransitionPicker value={scene.transition} disabled={isLast} onChange={(transition) => onChange({...scene, transition})} />
              {isLast ? <p className="mt-2 text-xs text-studio-muted">Last scene has no outgoing transition.</p> : null}
            </Field>
            <Field label="Transition duration">
              <select
                value={scene.transitionDuration ?? 0.25}
                disabled={isLast}
                onChange={(event) => onChange({...scene, transitionDuration: Number(event.target.value)})}
                className="studio-input w-full rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-55"
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
                    value={selectedStartCueId}
                    onChange={(event) => updateSrtMapping(event.target.value || null, selectedEndCueId || null)}
                    className="studio-input w-full rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Select start cue</option>
                    {srtCues.map((cue) => <option key={cue.id} value={cue.id}>{cueLabel(cue)}</option>)}
                  </select>
                </Field>
                <Field label="End subtitle cue">
                  <select
                    value={selectedEndCueId}
                    onChange={(event) => updateSrtMapping(selectedStartCueId || null, event.target.value || null)}
                    className="studio-input w-full rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Select end cue</option>
                    {srtCues.map((cue) => <option key={cue.id} value={cue.id}>{cueLabel(cue)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Image start offset">
                  <NumberInput
                    value={scene.srtStartOffset ?? 0}
                    min={-10}
                    max={10}
                    step={0.1}
                    onCommit={(srtStartOffset) => updateVisualTiming({...scene, srtStartOffset})}
                  />
                  <p className="mt-2 text-xs text-studio-muted">Negative asks this image to start before the first mapped cue.</p>
                </Field>
                <Field label="Hold image after cue">
                  <NumberInput
                    value={scene.srtEndHold ?? 0}
                    min={0}
                    max={10}
                    step={0.1}
                    onCommit={(srtEndHold) => updateVisualTiming({...scene, srtEndHold})}
                  />
                  <p className="mt-2 text-xs text-studio-muted">Keeps this image visible and delays the next image scene.</p>
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
                  <div className="mt-2 space-y-1 text-xs text-studio-muted">
                    <p>Cue timing: {formatShortTimestamp(srtTiming.baseStart)} - {formatShortTimestamp(srtTiming.baseEnd)}</p>
                    {shiftedByPrevious > 0 ? (
                      <p>This image waits {formatSeconds(shiftedByPrevious)} because the previous scene is holding.</p>
                    ) : null}
                  </div>
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

function getShiftedByPrevious(timing: ReturnType<typeof getSceneSrtTiming> | SceneVisualTiming | null) {
  if (!timing || !("shiftedByPrevious" in timing) || typeof timing.shiftedByPrevious !== "number") return 0;
  return timing.shiftedByPrevious;
}

function getSelectedCueId(cueId: string | null | undefined, cues: SrtCue[], fallbackCueId: string | undefined) {
  if (cueId && cues.some((cue) => cue.id === cueId)) return cueId;
  return fallbackCueId ?? "";
}

function MappedSrtPreview({mappedCues, voSegment}: {mappedCues: SrtCue[]; voSegment: string}) {
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
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">VO Segment</p>
            <p className="mt-2 text-sm font-bold leading-6 text-white">{voSegment}</p>
          </div>
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

function SceneStatusPill({status}: {status: ReturnType<typeof getSceneStatus>}) {
  const config = {
    empty: {label: "Empty", className: "bg-white/10 text-studio-muted"},
    mapped: {label: "Mapped", className: "bg-studio-cyan/10 text-cyan-100"},
    image_missing: {label: "Image Missing", className: "bg-amber-400/15 text-amber-100"},
    ready: {label: "Ready", className: "bg-emerald-400/15 text-emerald-200"},
  }[status];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${config.className}`}>
      {config.label}
    </span>
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
