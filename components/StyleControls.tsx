"use client";

import {useState} from "react";
import type {CukiProject, ImageEffect, MotionSpeed, SubtitleMode, SubtitlePosition, SubtitleSize} from "@/lib/types";
import {imageEffects, motionSpeeds, subtitleModes, subtitlePositions, subtitleSizes, subtitleStyles, templates, transitionDurations, transitions} from "@/lib/presets";
import {SubtitleStylePicker} from "./SubtitleStylePicker";
import {TransitionPicker} from "./TransitionPicker";

export function StyleControls({
  project,
  onChange,
  onApplyTemplate,
}: {
  project: CukiProject;
  onChange: (project: CukiProject) => void;
  onApplyTemplate: (templateId: string) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const template = templates.find((item) => item.id === selectedTemplate) ?? templates[0];

  function applyStyleSettingsToScenes() {
    onChange({
      ...project,
      scenes: project.scenes.map((scene) => ({
        ...scene,
        subtitleStyle: project.globalSubtitleStyle,
        effect: project.globalImageEffect,
        transition: project.globalTransition,
        transitionDuration: project.transitionDuration,
      })),
    });
  }

  function resetToTemplateDefaults() {
    const globalSubtitleStyle = template.subtitleStyle;
    const globalImageEffect = template.effects[0] ?? project.globalImageEffect;
    const globalTransition = template.transitions[0] ?? project.globalTransition;
    onChange({
      ...project,
      globalSubtitleStyle,
      globalImageEffect,
      globalTransition,
      effectSpeed: "normal",
      transitionDuration: 0.25,
      subtitleMode: "full",
      subtitleSize: "normal",
      subtitlePosition: "lowerThird",
      scenes: project.scenes.map((scene) => ({
        ...scene,
        subtitleStyle: globalSubtitleStyle,
        effect: globalImageEffect,
        transition: globalTransition,
        transitionDuration: 0.25,
      })),
    });
  }

  return (
    <div className="space-y-4">
      <SettingCard title="Subtitle Settings" description="Control how captions appear on screen.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Subtitle Style">
            <SubtitleStylePicker
              value={project.globalSubtitleStyle}
              onChange={(globalSubtitleStyle) => onChange({...project, globalSubtitleStyle})}
            />
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

          <Field label="Subtitle Size">
            <select
              value={project.subtitleSize}
              onChange={(event) => onChange({...project, subtitleSize: event.target.value as SubtitleSize})}
              className="studio-input w-full rounded-xl px-3 py-2 text-sm"
            >
              {subtitleSizes.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Subtitle Position">
            <select
              value={project.subtitlePosition}
              onChange={(event) => onChange({...project, subtitlePosition: event.target.value as SubtitlePosition})}
              className="studio-input w-full rounded-xl px-3 py-2 text-sm"
            >
              {subtitlePositions.map((position) => (
                <option key={position.value} value={position.value}>{position.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </SettingCard>

      <SettingCard title="Motion Settings" description="Control how each comic panel moves.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Motion Effect">
            <select
              value={project.globalImageEffect}
              onChange={(event) => {
                const globalImageEffect = event.target.value as ImageEffect;
                onChange({...project, globalImageEffect});
              }}
              className="studio-input w-full rounded-xl px-3 py-2 text-sm"
            >
              {imageEffects.map((effect) => (
                <option key={effect.value} value={effect.value}>{effect.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-studio-muted">Used as the default for new scenes. Use Apply Settings to update existing scenes.</p>
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
        </div>
      </SettingCard>

      <SettingCard title="Transition Settings" description="Control how scenes change.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Transition Type">
            <TransitionPicker
              value={project.globalTransition}
              onChange={(globalTransition) => onChange({...project, globalTransition})}
            />
            <p className="mt-2 text-xs text-studio-muted">Used as the default for new scenes. Existing scenes keep their own transition until applied.</p>
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
            <p className="mt-2 text-xs text-studio-muted">Default duration for new scene transitions.</p>
          </Field>
        </div>
      </SettingCard>

      <SettingCard title="Apply Settings" description="Apply these choices globally or keep scene-level edits.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Field label="Template">
            <select
              value={selectedTemplate}
              onChange={(event) => setSelectedTemplate(event.target.value)}
              className="studio-input w-full rounded-xl px-3 py-2 text-sm"
            >
              {templates.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-studio-muted">{template.description}</p>
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <button onClick={() => onApplyTemplate(selectedTemplate)} className="btn-secondary w-full px-4 py-3 text-sm sm:w-auto">
              Apply Template to All Scenes
            </button>
            <button onClick={applyStyleSettingsToScenes} className="btn-primary w-full px-4 py-3 text-sm sm:w-auto">
              Apply Style Settings to All Scenes
            </button>
            <button onClick={resetToTemplateDefaults} className="btn-quiet w-full px-4 py-3 text-sm sm:w-auto">
              Reset to Template Defaults
            </button>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Current Style Summary" description="Quick read of the style that will render.">
        <div className="grid gap-3 md:grid-cols-3">
          <SummaryItem label="Subtitle" value={`${labelFor(subtitleStyles, project.globalSubtitleStyle)} · ${labelFor(subtitleModes, project.subtitleMode)} · ${labelFor(subtitleSizes, project.subtitleSize)} · ${labelFor(subtitlePositions, project.subtitlePosition)}`} />
          <SummaryItem label="Motion" value={`${labelFor(imageEffects, project.globalImageEffect)} · ${labelFor(motionSpeeds, project.effectSpeed)}`} />
          <SummaryItem label="Transition" value={`${labelFor(transitions, project.globalTransition)} · ${labelFor(transitionDurations, project.transitionDuration)}`} />
        </div>
      </SettingCard>
    </div>
  );
}

function SettingCard({title, description, children}: {title: string; description: string; children: React.ReactNode}) {
  return (
    <section className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5">
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-studio-muted">{description}</p>
      </div>
      {children}
    </section>
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

function SummaryItem({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</p>
      <p className="mt-2 text-sm font-extrabold leading-6 text-white">{value}</p>
    </div>
  );
}

function labelFor<T extends string | number>(items: Array<{value: T; label: string}>, value: T) {
  return items.find((item) => item.value === value)?.label ?? String(value);
}
