"use client";

import type {CukiProject, MotionSpeed, SubtitleMode} from "@/lib/types";
import {motionSpeeds, subtitleModes, transitionDurations} from "@/lib/presets";
import {SubtitleStylePicker} from "./SubtitleStylePicker";
import {TransitionPicker} from "./TransitionPicker";

export function StyleControls({project, onChange}: {project: CukiProject; onChange: (project: CukiProject) => void}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div>
        <h2 className="text-xl font-extrabold text-white">Global Style Controls</h2>
        <p className="mt-1 text-sm text-studio-muted">These settings apply across the video so scene cards stay focused on building panels.</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Subtitle Style">
          <SubtitleStylePicker
            value={project.globalSubtitleStyle}
            onChange={(globalSubtitleStyle) =>
              onChange({
                ...project,
                globalSubtitleStyle,
                scenes: project.scenes.map((scene) => ({...scene, subtitleStyle: globalSubtitleStyle})),
              })
            }
          />
        </Field>

        <Field label="Transition Type">
          <TransitionPicker
            value={project.globalTransition}
            onChange={(globalTransition) =>
              onChange({
                ...project,
                globalTransition,
                scenes: project.scenes.map((scene) => ({...scene, transition: globalTransition})),
              })
            }
          />
        </Field>

        <Field label="Motion Speed">
          <select
            value={project.effectSpeed}
            onChange={(event) => onChange({...project, effectSpeed: event.target.value as MotionSpeed})}
            className="studio-input w-full rounded-xl px-3 py-2 text-sm"
          >
            {motionSpeeds.map((speed) => (
              <option key={speed.value} value={speed.value}>{speed.label}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-studio-muted">{motionSpeeds.find((speed) => speed.value === project.effectSpeed)?.description}</p>
        </Field>

        <Field label="Transition Duration">
          <select
            value={project.transitionDuration}
            onChange={(event) => onChange({...project, transitionDuration: Number(event.target.value)})}
            className="studio-input w-full rounded-xl px-3 py-2 text-sm"
          >
            {transitionDurations.map((duration) => (
              <option key={duration.value} value={duration.value}>{duration.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Subtitle Mode">
          <select
            value={project.subtitleMode}
            onChange={(event) => onChange({...project, subtitleMode: event.target.value as SubtitleMode})}
            className="studio-input w-full rounded-xl px-3 py-2 text-sm"
          >
            {subtitleModes.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-studio-muted">{subtitleModes.find((mode) => mode.value === project.subtitleMode)?.description}</p>
        </Field>
      </div>
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
