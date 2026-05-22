"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {RenderPanel} from "./RenderPanel";
import {SceneEditor} from "./SceneEditor";
import {StyleControls} from "./StyleControls";
import {VideoPreview} from "./VideoPreview";
import {VoiceSrtPanel} from "./VoiceSrtPanel";
import type {CukiProject} from "@/lib/types";
import {autoDistributeDurations, normalizeDurations} from "@/lib/timing";
import {getProject, saveProject} from "@/lib/storage";
import {templates} from "@/lib/presets";
import {getAssignedSrtCueIds, getSceneSrtTiming} from "@/lib/srt";
import {reorderScenes} from "@/lib/utils";

export function ProjectEditor({projectId}: {projectId: string}) {
  const [project, setProject] = useState<CukiProject | null>(null);
  const [saveStatus, setSaveStatus] = useState("Loading...");
  const [storageError, setStorageError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeStep, setActiveStep] = useState<EditorStep>("scenes");

  useEffect(() => {
    const loaded = getProject(projectId);
    setProject(loaded);
    setSaveStatus(loaded ? "Loaded" : "Project not found");
    setHasLoaded(true);
  }, [projectId]);

  useEffect(() => {
    if (!project) return;
    const timeout = window.setTimeout(() => {
      try {
        saveProject(project);
        setSaveStatus("Saved locally");
        setStorageError(null);
      } catch {
        setStorageError("Save failed. Browser storage may be full because uploaded files are stored locally in this MVP.");
        setSaveStatus("Save failed");
      }
    }, 450);
    setSaveStatus("Unsaved changes");
    return () => window.clearTimeout(timeout);
  }, [project]);

  if (!hasLoaded) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5">
        <div className="glass-card rounded-[1.5rem] p-8 text-center">
          <h1 className="text-2xl font-extrabold text-white">Loading project...</h1>
          <p className="mt-2 text-studio-muted">Reading local browser storage.</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5">
        <div className="glass-card rounded-[1.5rem] p-8 text-center">
          <h1 className="text-2xl font-extrabold text-white">Project not found</h1>
          <p className="mt-2 text-studio-muted">This local project may have been deleted or saved in another browser.</p>
          <Link href="/" className="btn-primary mt-6 px-5 py-3">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  function update(nextProject: CukiProject) {
    setProject(nextProject);
  }

  function forceSave() {
    if (!project) return;
    try {
      const saved = saveProject(project);
      setProject(saved);
      setSaveStatus("Saved locally");
      setStorageError(null);
    } catch {
      setStorageError("Save failed. Browser storage may be full because uploaded files are stored locally in this MVP.");
      setSaveStatus("Save failed");
    }
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!project || !template) return;
    update({
      ...project,
      globalSubtitleStyle: template.subtitleStyle,
      globalImageEffect: template.effects[0] ?? project.globalImageEffect,
      globalTransition: template.transitions[0] ?? project.globalTransition,
      scenes: project.scenes.map((scene, index) => ({
        ...scene,
        subtitleStyle: template.subtitleStyle,
        effect: template.effects[index % template.effects.length],
        transition: template.transitions[index % template.transitions.length],
        transitionDuration: project.transitionDuration,
      })),
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-5 py-5 sm:px-8">
      <header className="sticky top-0 z-20 -mx-5 mb-5 border-b border-white/10 bg-studio-ink/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link href="/" className="btn-quiet px-4 py-2 text-sm">
              Dashboard
            </Link>
            <input
              value={project.title}
              onChange={(event) => update({...project, title: event.target.value})}
              className="min-w-0 flex-1 bg-transparent text-2xl font-extrabold text-white outline-none sm:text-3xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${saveStatus === "Saved locally" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-studio-muted"}`}>
              {saveStatus}
            </span>
            <button onClick={forceSave} className="btn-secondary px-4 py-2 text-sm">
              Save Project
            </button>
          </div>
        </div>
      </header>

      {storageError ? <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{storageError}</div> : null}
      <div className="guidance-card mb-5 rounded-2xl p-4 text-sm">
        Files are session-only in this MVP. Project metadata, SRT cues, mappings, style, timing, effects, and transitions are saved locally; re-select image/audio files after refresh if needed.
      </div>

      <StepNav activeStep={activeStep} project={project} onChange={setActiveStep} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          {activeStep === "scenes" ? (
            <StepShell
              eyebrow="Step 1"
              title="Build Scenes"
              description="Start with panels and captions. Keep timing rough here; VO sync comes next."
              footer={<StepFooter nextLabel="Next: Voice Over" onNext={() => setActiveStep("voice")} />}
            >
              <SceneEditor
                scenes={project.scenes}
                sceneDefaults={{subtitleStyle: project.globalSubtitleStyle, transition: project.globalTransition, effect: project.globalImageEffect}}
                audioMode={project.audioMode}
                srtCues={project.srtCues ?? []}
                onChange={(scenes) => update({...project, scenes: reorderScenes(scenes)})}
              />
            </StepShell>
          ) : null}

          {activeStep === "voice" ? (
            <StepShell
              eyebrow="Step 2"
              title="Voice & SRT Timing"
              description="Upload narration and SRT timing. SRT drives subtitle timing while CukiStory keeps visual style control."
              footer={<StepFooter previousLabel="Back: Scenes" nextLabel="Next: Style" onPrevious={() => setActiveStep("scenes")} onNext={() => setActiveStep("style")} />}
            >
              <div className="space-y-5">
                <VoiceSrtPanel project={project} onChange={update} />
                {project.audioMode !== "fullVoSrt" ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                    <h3 className="text-lg font-extrabold text-white">Estimated Timing Tools</h3>
                    <p className="mt-1 text-sm text-studio-muted">Fallback timing estimates speech from subtitles and syncs to VO when audio exists.</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => update({...project, scenes: autoDistributeDurations(project.scenes, project.audioDuration)})}
                        className="btn-primary px-5 py-3"
                      >
                        Auto Timing
                      </button>
                      <button
                        onClick={() => update({...project, scenes: normalizeDurations(project.scenes, project.audioDuration)})}
                        className="btn-secondary px-5 py-3"
                      >
                        Normalize Duration
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </StepShell>
          ) : null}

          {activeStep === "style" ? (
            <StepShell
              eyebrow="Step 3"
              title="Style"
              description="Choose the global caption look, transition behavior, motion speed, and subtitle reveal mode."
              footer={<StepFooter previousLabel="Back: Voice Over" nextLabel="Next: Preview" onPrevious={() => setActiveStep("voice")} onNext={() => setActiveStep("preview")} />}
            >
              <StyleControls project={project} onChange={update} onApplyTemplate={applyTemplate} />
            </StepShell>
          ) : null}

          {activeStep === "preview" ? (
            <StepShell
              eyebrow="Step 4"
              title="Preview & Render"
              description="Review the final video, check export guidance, then render the MP4."
              footer={<StepFooter previousLabel="Back: Style" onPrevious={() => setActiveStep("style")} />}
            >
              <FinalChecklist project={project} />
            </StepShell>
          ) : null}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <VideoPreview project={project} />
          {activeStep === "preview" ? (
            <RenderPanel project={project} onSave={forceSave} />
          ) : (
            <ActiveStepHint activeStep={activeStep} onPreview={() => setActiveStep("preview")} />
          )}
        </aside>
      </div>
    </main>
  );
}

type EditorStep = "scenes" | "voice" | "style" | "preview";

const steps: Array<{id: EditorStep; label: string; description: string}> = [
  {id: "scenes", label: "Scenes", description: "Panels and captions"},
  {id: "voice", label: "Voice & SRT", description: "Audio and subtitle timing"},
  {id: "style", label: "Style", description: "Captions and motion"},
  {id: "preview", label: "Preview & Render", description: "Export MP4"},
];

function StepNav({activeStep, project, onChange}: {activeStep: EditorStep; project: CukiProject; onChange: (step: EditorStep) => void}) {
  return (
    <nav className="mb-5 grid gap-3 lg:grid-cols-4">
      {steps.map((step, index) => {
        const active = activeStep === step.id;
        return (
          <button
            key={step.id}
            onClick={() => onChange(step.id)}
            className={`rounded-[1.25rem] border p-4 text-left transition ${
              active ? "border-studio-cyan/50 bg-studio-cyan/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-studio-muted">Step {index + 1}</span>
              <StepStatus step={step.id} project={project} />
            </div>
            <p className="mt-2 font-extrabold text-white">{step.label}</p>
            <p className="mt-1 text-xs text-studio-muted">{step.description}</p>
          </button>
        );
      })}
    </nav>
  );
}

function StepStatus({step, project}: {step: EditorStep; project: CukiProject}) {
  const ready = {
    scenes: project.scenes.length > 0,
    voice: project.audioMode === "fullVoSrt" ? Boolean(project.audioDuration && project.srtCues?.length) : Boolean(project.audioDuration),
    style: true,
    preview: project.scenes.length > 0 && Boolean(project.audioDuration),
  }[step];

  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold ${ready ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-studio-muted"}`}>
      {ready ? "Ready" : "Setup"}
    </span>
  );
}

function StepShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-6 border-b border-white/10 pb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-studio-cyan">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-studio-muted">{description}</p>
      </div>
      {children}
      {footer ? <div className="mt-6 border-t border-white/10 pt-5">{footer}</div> : null}
    </section>
  );
}

function StepFooter({
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: {
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <div>{previousLabel && onPrevious ? <button onClick={onPrevious} className="btn-secondary px-5 py-3">{previousLabel}</button> : null}</div>
      <div>{nextLabel && onNext ? <button onClick={onNext} className="btn-primary px-5 py-3">{nextLabel}</button> : null}</div>
    </div>
  );
}

function ActiveStepHint({activeStep, onPreview}: {activeStep: EditorStep; onPreview: () => void}) {
  const text = {
    scenes: "Build your panels first. Preview updates live as soon as scenes are added.",
    voice: "Upload VO and SRT timing. The preview stays available while timing changes.",
    style: "Style choices apply to the preview immediately.",
    preview: "Ready for final review.",
  }[activeStep];

  return (
    <div className="guidance-card rounded-[1.5rem] p-5 text-sm">
      <p className="font-extrabold text-white">Current Step</p>
      <p className="mt-2 leading-6">{text}</p>
      <button onClick={onPreview} className="btn-secondary mt-4 w-full px-4 py-3 text-sm">
        Go to Preview & Render
      </button>
    </div>
  );
}

function FinalChecklist({project}: {project: CukiProject}) {
  const srtCues = project.srtCues ?? [];
  const assignedCueIds = getAssignedSrtCueIds(project.scenes, srtCues);
  const assignedCueCount = srtCues.filter((cue) => assignedCueIds.has(cue.id)).length;
  const mappedSceneCount = project.scenes.filter((scene) => getSceneSrtTiming(scene, srtCues)).length;
  const subtitleModeLabel = {
    full: "Full subtitle chunks enabled",
    wordByWord: "Word-by-word subtitles enabled",
    karaoke: "Karaoke subtitles enabled",
  }[project.subtitleMode];
  const items = [
    {label: `${project.scenes.length} scene${project.scenes.length === 1 ? "" : "s"} added`, ready: project.scenes.length > 0},
    {label: project.audioDuration ? "Voice over loaded" : "Voice over still needed", ready: Boolean(project.audioDuration)},
    {label: project.audioMode === "fullVoSrt" ? `${project.srtCues?.length ?? 0} SRT cues parsed` : "Estimated timing fallback", ready: project.audioMode !== "fullVoSrt" || Boolean(project.srtCues?.length)},
    ...(project.audioMode === "fullVoSrt" ? [
      {label: `${mappedSceneCount}/${project.scenes.length} scenes mapped to SRT`, ready: project.scenes.length > 0 && mappedSceneCount === project.scenes.length},
      {label: `${assignedCueCount}/${srtCues.length} SRT cues assigned`, ready: srtCues.length > 0 && assignedCueCount === srtCues.length},
    ] : []),
    {label: "Global style selected", ready: true},
    {label: subtitleModeLabel, ready: true},
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className={`rounded-2xl border p-4 ${item.ready ? "border-emerald-400/20 bg-emerald-400/10" : "border-studio-cyan/20 bg-studio-cyan/10"}`}>
          <p className="text-sm font-extrabold text-white">{item.label}</p>
          <p className="mt-1 text-xs text-studio-muted">{item.ready ? "Ready" : "Finish this before the cleanest render"}</p>
        </div>
      ))}
    </div>
  );
}
