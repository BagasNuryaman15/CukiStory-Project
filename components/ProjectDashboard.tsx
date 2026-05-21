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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-studio-panel/70 p-5 shadow-glow sm:p-7">
        <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-studio-pink/20 blur-3xl" />
        <div className="absolute -bottom-24 left-24 h-64 w-64 rounded-full bg-studio-cyan/16 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-studio-cyan">Local Creator Studio</p>
            <h1 className="font-display text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              CukiStory Tools
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-studio-muted">
              Turn comic panels, subtitles, and VO into vertical MP4 videos.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-studio-muted sm:w-[360px]">
            <StudioStat value={String(projects.length)} label="Projects" />
            <StudioStat value="9:16" label="Canvas" />
            <StudioStat value="30fps" label="Output" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.6fr]">
        <div className="glass-card neon-border rounded-[1.5rem] p-6">
          <h2 className="text-xl font-extrabold text-white">Create Project</h2>
          <p className="mt-2 text-sm text-studio-muted">Everything stays in this browser. No login, no cloud, no AI API.</p>
          <div className="mt-6 flex flex-col gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreate();
              }}
              className="studio-input rounded-2xl px-4 py-3"
              placeholder="Project title"
            />
            <button
              onClick={handleCreate}
              className="btn-primary px-5 py-3"
            >
              Create New Project
            </button>
          </div>
          <div className="guidance-card mt-6 rounded-2xl p-4 text-sm">
            Large audio/image uploads may hit localStorage limits in this MVP. If saving fails, use smaller files or split the project.
          </div>
        </div>

        <div className="glass-card rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Local Projects</h2>
              <p className="mt-1 text-sm text-studio-muted">{projects.length} saved in this browser</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-[1.25rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
              <p className="text-xl font-extrabold text-white">No projects yet</p>
              <p className="mt-2 text-studio-muted">Create one, upload VO, add comic panels, then render a vertical MP4.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <article key={project.id} className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5 transition hover:-translate-y-0.5 hover:border-studio-cyan/50 hover:bg-white/[0.04]">
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-extrabold leading-6 text-white">{project.title}</h3>
                      <StatusPill project={project} />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <Metric label="Scenes" value={`${project.scenes.length} panels`} />
                      <Metric label="Audio" value={project.audioDuration ? formatSeconds(project.audioDuration) : "Needed"} />
                    </div>
                    <p className="mt-4 border-t border-white/10 pt-3 text-xs text-studio-muted">
                      Updated {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </Link>
                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="btn-secondary flex-1 px-3 py-2 text-sm"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="btn-danger px-3 py-2 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StudioStat({value, label}: {value: string; label: string}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <p className="text-base font-extrabold text-white">{value}</p>
      <p className="mt-0.5 uppercase tracking-[0.18em]">{label}</p>
    </div>
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
