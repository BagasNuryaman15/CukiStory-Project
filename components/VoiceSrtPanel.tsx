"use client";

import {useRef, useState} from "react";
import type {AudioMode, CukiProject} from "@/lib/types";
import {autoMapSrtToScenes, formatShortTimestamp, getAssignedSrtCueIds, getSrtDuration, parseSrt, resetSceneSrtMappings, validateSrtCues} from "@/lib/srt";
import {formatSeconds, reorderScenes} from "@/lib/utils";
import {AudioUploader} from "./AudioUploader";
import {DurationSummary} from "./DurationSummary";

export function VoiceSrtPanel({project, onChange}: {project: CukiProject; onChange: (project: CukiProject) => void}) {
  const srtInputRef = useRef<HTMLInputElement>(null);
  const [srtError, setSrtError] = useState<string | null>(null);
  const srtCues = project.srtCues ?? [];
  const srtDuration = getSrtDuration(srtCues);
  const srtValidation = validateSrtCues(srtCues);
  const assignedCueIds = getAssignedSrtCueIds(project.scenes, srtCues);
  const assignedCueCount = srtCues.filter((cue) => assignedCueIds.has(cue.id)).length;
  const warnings = getVoiceSrtWarnings(project);

  async function handleSrtFile(file: File | undefined) {
    if (!file) return;

    setSrtError(null);
    try {
      const text = await file.text();
      const cues = parseSrt(text);
      onChange({
        ...project,
        audioMode: "fullVoSrt",
        srtRaw: text,
        srtCues: cues,
        srtFileName: file.name,
        scenes: resetSceneSrtMappings(project.scenes),
      });
      if (cues.length === 0) {
        setSrtError("No valid SRT cues were found. Check the exported .srt file and encoding.");
      } else {
        const validation = validateSrtCues(cues);
        if (!validation.isValid) setSrtError(validation.errors[0]?.message ?? "SRT has timing issues.");
      }
    } catch {
      setSrtError("SRT failed to load. Export the subtitle as UTF-8 / Unicode .srt and try again.");
    }
  }

  function changeAudioMode(audioMode: AudioMode) {
    onChange({...project, audioMode});
  }

  function autoMap() {
    if (srtCues.length === 0 || project.scenes.length === 0) return;
    onChange({...project, scenes: reorderScenes(autoMapSrtToScenes(project.scenes, srtCues))});
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
        <div className="mb-5">
          <h3 className="text-xl font-extrabold text-white">Voice & SRT Timing</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-studio-muted">
            Upload your full VO audio and the SRT file exported from CapCut. The SRT controls subtitle timing. CukiStory controls the subtitle style.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ModeButton
            active={project.audioMode === "fullVoSrt"}
            title="Full VO + SRT Timing - Recommended"
            description="Use one full narration file and one .srt timing file."
            onClick={() => changeAudioMode("fullVoSrt")}
          />
          <ModeButton
            active={project.audioMode === "fullVoEstimated"}
            title="Full VO Estimated Timing"
            description="Fallback mode using subtitle text estimates."
            onClick={() => changeAudioMode("fullVoEstimated")}
          />
        </div>

        <p className="mt-4 rounded-2xl border border-studio-cyan/20 bg-studio-cyan/10 p-4 text-sm font-bold text-cyan-100">
          SRT gives timing only. Subtitle visual style is controlled in the Style step.
        </p>
      </section>

      <AudioUploader
        audioUrl={project.audioUrl}
        audioDuration={project.audioDuration}
        onAudioChange={(audioUrl, audioDuration) => onChange({...project, audioUrl, audioDuration})}
      />

      <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white">SRT Subtitle Timing</h3>
            <p className="mt-1 text-sm text-studio-muted">Upload .srt encoded as UTF-8 / Unicode.</p>
          </div>
          <button onClick={() => srtInputRef.current?.click()} className={srtCues.length > 0 ? "btn-secondary px-4 py-3 text-sm" : "btn-primary px-4 py-3 text-sm"}>
            {srtCues.length > 0 ? "Replace SRT" : "Upload SRT"}
          </button>
        </div>

        <input
          ref={srtInputRef}
          type="file"
          accept=".srt,text/plain,application/x-subrip"
          className="hidden"
          onChange={(event) => handleSrtFile(event.target.files?.[0])}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoPanel label="SRT File" value={project.srtFileName || "No SRT"} />
          <InfoPanel label="Parsed Cues" value={`${srtCues.length}`} />
          <InfoPanel label="SRT Status" value={srtCues.length > 0 ? (srtValidation.isValid ? "Valid" : "Needs fix") : "Waiting"} />
        </div>
        {srtCues.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoPanel label="SRT Range" value={`${formatShortTimestamp(srtCues[0].start)} - ${formatShortTimestamp(srtDuration)}`} />
            <InfoPanel label="Raw SRT Stored" value={project.srtRaw ? "Yes" : "No"} />
          </div>
        ) : null}

        {srtError ? <p className="mt-4 text-sm text-red-200">{srtError}</p> : null}

        {srtValidation.errors.length > 0 && srtCues.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">
            <p className="font-extrabold">SRT validation</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {srtValidation.errors.map((error) => <li key={error.message}>{error.message}</li>)}
            </ul>
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="soft-warning mt-5 rounded-2xl p-4">
            <p className="font-extrabold">Timing checks</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              {srtValidation.warnings.map((warning) => <li key={warning.message}>{warning.message}</li>)}
            </ul>
          </div>
        ) : srtValidation.warnings.length > 0 ? (
          <div className="soft-warning mt-5 rounded-2xl p-4">
            <p className="font-extrabold">Timing checks</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {srtValidation.warnings.map((warning) => <li key={warning.message}>{warning.message}</li>)}
            </ul>
          </div>
        ) : null}

        {srtCues.length > 0 ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-studio-muted">
                {assignedCueCount} of {srtCues.length} cues assigned to scenes.
              </p>
              <button onClick={autoMap} disabled={project.scenes.length === 0} className="btn-secondary px-4 py-3 text-sm">
                Auto Map SRT to Scenes
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              {srtCues.slice(0, 20).map((cue) => (
                <div key={cue.id} className="rounded-xl bg-black/20 p-3 text-sm">
                  <p className="font-bold text-white">{cue.index} - {formatShortTimestamp(cue.start)} - {formatShortTimestamp(cue.end)}</p>
                  <p className="mt-1 text-studio-muted">{cue.text}</p>
                </div>
              ))}
              {srtCues.length > 20 ? <p className="px-2 text-xs text-studio-muted">Showing first 20 cues.</p> : null}
            </div>
          </div>
        ) : null}
      </section>

      <DurationSummary project={project} />
    </div>
  );
}

function ModeButton({active, title, description, onClick}: {active: boolean; title: string; description: string; onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${active ? "border-studio-cyan/50 bg-studio-cyan/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"}`}
    >
      <p className="font-extrabold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-studio-muted">{description}</p>
    </button>
  );
}

function InfoPanel({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-studio-muted">{label}</p>
      <p className="mt-2 break-words text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function getVoiceSrtWarnings(project: CukiProject) {
  const warnings: string[] = [];
  const cues = project.srtCues ?? [];
  const srtDuration = getSrtDuration(cues);

  if (!project.audioUrl) warnings.push("No full VO audio uploaded yet.");
  if (project.audioMode === "fullVoSrt" && !project.srtFileName) warnings.push("No SRT file uploaded yet.");
  if (project.audioMode === "fullVoSrt" && cues.length === 0) warnings.push("SRT cues are empty.");

  if (project.audioDuration && srtDuration > 0) {
    const difference = srtDuration - project.audioDuration;
    if (difference > 0.75) warnings.push(`SRT is ${formatSeconds(difference)} longer than audio.`);
    if (difference < -0.75) warnings.push(`SRT ends ${formatSeconds(Math.abs(difference))} before audio ends.`);
  }

  return warnings;
}
