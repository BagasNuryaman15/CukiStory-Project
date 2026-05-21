"use client";

import {useRef, useState} from "react";
import {fileToDataUrl, formatSeconds} from "@/lib/utils";

export function AudioUploader({
  audioUrl,
  audioDuration,
  onAudioChange,
}: {
  audioUrl: string | null;
  audioDuration: number | null;
  onAudioChange: (audioUrl: string, duration: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsReading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const duration = await readAudioDuration(dataUrl);
      onAudioChange(dataUrl, duration);
    } catch {
      setError("Audio failed to load. Try mp3, wav, or m4a.");
    } finally {
      setIsReading(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Voice Over Audio</h2>
          <p className="mt-1 text-sm text-studio-muted">Upload mp3, wav, or m4a. Duration is read in the browser.</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className={audioUrl ? "btn-secondary px-4 py-3 text-sm" : "btn-primary px-4 py-3 text-sm"}
        >
          {audioUrl ? "Replace VO" : "Upload VO"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/m4a,audio/mp4"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <div className="mt-5">
        {audioUrl ? (
          <div className="space-y-3">
            <audio controls src={audioUrl} className="w-full" />
            <p className="text-sm text-studio-muted">Audio duration: <span className="font-bold text-white">{formatSeconds(audioDuration)}</span></p>
          </div>
        ) : (
          <div className="guidance-card rounded-2xl border-dashed p-4 text-sm">
            Upload VO when ready. You can still arrange scenes and preview visuals first.
          </div>
        )}
        {isReading ? <p className="mt-3 text-sm text-studio-cyan">Reading audio duration...</p> : null}
        {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      </div>
    </div>
  );
}

function readAudioDuration(audioUrl: string) {
  return new Promise<number>((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (!Number.isFinite(audio.duration)) {
        reject(new Error("Invalid duration"));
        return;
      }
      resolve(Math.round(audio.duration * 100) / 100);
    };
    audio.onerror = () => reject(new Error("Audio error"));
    audio.src = audioUrl;
  });
}
