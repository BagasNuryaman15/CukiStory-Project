"use client";

import type {CukiProject} from "@/lib/types";

export function StoryPackagePanel({project, onChange}: {project: CukiProject; onChange: (project: CukiProject) => void}) {
  const finalVoWords = project.finalVO.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <PackageStat label="Final VO" value={finalVoWords > 0 ? `${finalVoWords} words` : "Needed"} ready={finalVoWords > 0} />
        <PackageStat label="Hook" value={project.hook.trim() ? "Ready" : "Needed"} ready={Boolean(project.hook.trim())} />
        <PackageStat label="Upload Copy" value={project.youtubeDescription.trim() ? "Ready" : "Optional"} ready={Boolean(project.youtubeDescription.trim())} />
      </div>

      <div className="grid items-start gap-5 md:grid-cols-2">
        <Field label="Title">
          <input
            value={project.title}
            onChange={(event) => onChange({...project, title: event.target.value})}
            className="studio-input w-full rounded-xl px-4 py-3"
            placeholder="Video title"
          />
        </Field>
        <Field label="Tagline">
          <input
            value={project.tagline}
            onChange={(event) => onChange({...project, tagline: event.target.value})}
            className="studio-input w-full rounded-xl px-4 py-3"
            placeholder="Short production tagline"
          />
        </Field>
      </div>

      <Field label="Hook">
        <textarea
          value={project.hook}
          onChange={(event) => onChange({...project, hook: event.target.value})}
          rows={3}
          className="studio-input w-full resize-y rounded-xl px-4 py-3"
          placeholder="Opening hook that should stop the scroll..."
        />
      </Field>

      <Field label={`Final VO${finalVoWords > 0 ? ` - ${finalVoWords} words` : ""}`}>
        <textarea
          value={project.finalVO}
          onChange={(event) => onChange({...project, finalVO: event.target.value})}
          rows={9}
          className="studio-input w-full resize-y rounded-xl px-4 py-3 leading-7"
          placeholder="Paste the final voice-over script here..."
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <Field label="YouTube Shorts Description">
          <textarea
            value={project.youtubeDescription}
            onChange={(event) => onChange({...project, youtubeDescription: event.target.value})}
            rows={5}
            className="studio-input w-full resize-y rounded-xl px-4 py-3"
            placeholder="Description/caption for upload..."
          />
        </Field>
        <Field label="Hashtags">
          <textarea
            value={project.hashtags}
            onChange={(event) => onChange({...project, hashtags: event.target.value})}
            rows={5}
            className="studio-input w-full resize-y rounded-xl px-4 py-3"
            placeholder="#shorts #story"
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={project.notes}
          onChange={(event) => onChange({...project, notes: event.target.value})}
          rows={4}
          className="studio-input w-full resize-y rounded-xl px-4 py-3"
          placeholder="Production notes, revision notes, upload notes..."
        />
      </Field>
    </section>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</span>
      {children}
    </label>
  );
}

function PackageStat({label, value, ready}: {label: string; value: string; ready: boolean}) {
  return (
    <div className={`rounded-2xl border p-4 ${ready ? "border-emerald-400/20 bg-emerald-400/10" : "border-studio-cyan/20 bg-studio-cyan/10"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-studio-muted">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}
