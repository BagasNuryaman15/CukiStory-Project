"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import type {CukiProject} from "@/lib/types";
import {createProject, deleteProject, getProjects} from "@/lib/storage";
import {formatSeconds} from "@/lib/utils";

export function ProjectDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<CukiProject[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  function handleCreate() {
    const project = createProject(title || "New CukiStory");
    setTitle("");
    router.push(`/projects/${project.id}`);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this local project?")) return;
    deleteProject(id);
    setProjects(getProjects());
  }

  return (
    <main className="dashboard-stage min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="cockpit-frame mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-[1480px] rounded-[2rem] border border-white/10 px-5 py-6 sm:px-8 lg:px-10">
        <div className="cockpit-border" aria-hidden="true" />
        <div className="relative">
          <div className="grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)_210px]">
            <SideSignal
              align="left"
              eyebrow="Local"
              title="Browser Studio"
              lines={["No login", "No cloud", "No AI API"]}
            />

            <header className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-studio-cyan">SRT-Driven Production Cockpit</p>
              <h1 className="mt-4 font-display text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
                CukiStory Tools
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-studio-muted sm:text-base">
                Final VO, SRT timing, visual scene mapping, preview sync, and vertical Remotion render in one internal cockpit.
              </p>
            </header>

            <SideSignal
              align="right"
              eyebrow="Output"
              title="Shorts Engine"
              lines={["9:16 canvas", "30fps MP4", `${projects.length} projects`]}
            />
          </div>

          <div className="mx-auto mt-8 max-w-6xl">
            <div className="cyber-display rounded-[1.5rem] border border-white/10 p-3 sm:p-4">
              <div className="cyber-display-grid" aria-hidden="true" />
              <div className="relative grid min-h-[430px] place-items-center overflow-hidden rounded-[1.2rem] bg-black/35">
                <CyberpunkVisual />
                <div className="hud-label hud-label-tl">VOICE / SRT</div>
                <div className="hud-label hud-label-tr">SCENE MAP</div>
                <div className="hud-label hud-label-bl">PREVIEW SYNC</div>
                <div className="hud-label hud-label-br">MP4 RENDER</div>
                <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-studio-cyan">Production Flow</p>
                  <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
                    Story videos, timed by SRT
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-6 text-cyan-100">
                    Build the package, upload final VO, map subtitle cues to images, preview the sync, then render a clean vertical cut.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mx-auto -mt-10 max-w-2xl rounded-[1.25rem] border border-studio-cyan/25 bg-studio-ink/90 p-3 shadow-card backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-studio-muted">Launch New Production</p>
                  <span className="rounded-full bg-studio-cyan/10 px-2.5 py-1 text-[0.65rem] font-extrabold text-cyan-100">READY</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleCreate();
                    }}
                    className="studio-input rounded-xl px-4 py-3"
                    placeholder="Project title"
                  />
                  <button onClick={handleCreate} className="btn-primary px-5 py-3">
                    Create Project
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <PipelineNode label="Story Package" />
              <PipelineNode label="Audio & SRT" />
              <PipelineNode label="Scene Timeline" />
              <PipelineNode label="Preview Render" />
            </div>
          </div>

          <section className="mx-auto mt-8 max-w-5xl">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-studio-muted">Existing Production Nodes</p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">Local Projects</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-extrabold text-studio-muted">
                {projects.length} saved in browser
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                <p className="text-xl font-extrabold text-white">No projects yet</p>
                <p className="mt-2 text-studio-muted">Create one, upload VO, map SRT cues, then render a vertical MP4.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <ProjectNode key={project.id} project={project} onDelete={() => handleDelete(project.id)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function SideSignal({
  align,
  eyebrow,
  title,
  lines,
}: {
  align: "left" | "right";
  eyebrow: string;
  title: string;
  lines: string[];
}) {
  return (
    <aside className={`hidden pt-16 lg:block ${align === "right" ? "text-right" : "text-left"}`}>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-studio-cyan">{eyebrow}</p>
      <h2 className="mt-3 text-lg font-extrabold text-white">{title}</h2>
      <div className={`mt-4 space-y-2 ${align === "right" ? "items-end" : "items-start"}`}>
        {lines.map((line) => (
          <p key={line} className="text-sm font-bold text-studio-muted">{line}</p>
        ))}
      </div>
    </aside>
  );
}

function CyberpunkVisual() {
  return (
    <div className="cyber-visual" aria-hidden="true">
      <div className="cyber-vignette" />
      <div className="cyber-sun" />
      <div className="cyber-core" />
      <div className="cyber-orbit cyber-orbit-a" />
      <div className="cyber-orbit cyber-orbit-b" />
      <div className="cyber-card cyber-card-a" />
      <div className="cyber-card cyber-card-b" />
      <div className="cyber-card cyber-card-c" />
      <div className="cyber-line cyber-line-a" />
      <div className="cyber-line cyber-line-b" />
    </div>
  );
}

function PipelineNode({label}: {label: string}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-center">
      <p className="text-sm font-extrabold text-white">{label}</p>
      <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-studio-cyan to-studio-blue" />
    </div>
  );
}

function ProjectNode({project, onDelete}: {project: CukiProject; onDelete: () => void}) {
  return (
    <article className="project-node rounded-[1.25rem] border border-white/10 p-5">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-studio-muted">Production Node</p>
            <h3 className="mt-2 line-clamp-2 text-xl font-extrabold leading-7 text-white">{project.title}</h3>
          </div>
          <StatusPill project={project} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Scenes" value={`${project.scenes.length} panels`} />
          <Metric label="Audio" value={project.audioDuration ? formatSeconds(project.audioDuration) : "Needed"} />
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-studio-muted">
            <span>Production Readiness</span>
            <span>{getProjectProgress(project)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-studio-cyan via-studio-blue to-studio-pink" style={{width: `${getProjectProgress(project)}%`}} />
          </div>
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-xs text-studio-muted">
          Updated {new Date(project.updatedAt).toLocaleString()}
        </p>
      </Link>
      <div className="mt-5 flex gap-2">
        <Link href={`/projects/${project.id}`} className="btn-secondary flex-1 px-3 py-2 text-sm">
          Open
        </Link>
        <button onClick={onDelete} className="btn-danger px-3 py-2 text-sm">
          Delete
        </button>
      </div>
    </article>
  );
}

function Metric({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</p>
      <p className="mt-1 font-extrabold text-white">{value}</p>
    </div>
  );
}

function StatusPill({project}: {project: CukiProject}) {
  const ready = project.audioDuration && project.scenes.length > 0;
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${ready ? "bg-emerald-400/15 text-emerald-200" : "bg-studio-cyan/10 text-studio-cyan"}`}>
      {ready ? "Ready" : "Setup"}
    </span>
  );
}

function getProjectProgress(project: CukiProject) {
  const checks = [
    Boolean(project.title.trim()),
    Boolean(project.finalVO?.trim() || project.hook?.trim()),
    Boolean(project.audioDuration),
    project.scenes.length > 0,
    project.scenes.length > 0 && project.scenes.every((scene) => Boolean(scene.imageUrl)),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
