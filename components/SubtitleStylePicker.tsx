"use client";

import type {SubtitleStyle} from "@/lib/types";
import {subtitleStyles} from "@/lib/presets";

export function SubtitleStylePicker({value, onChange}: {value: SubtitleStyle; onChange: (value: SubtitleStyle) => void}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as SubtitleStyle)} className="studio-input w-full rounded-xl px-3 py-2 text-sm">
      {subtitleStyles.map((style) => (
        <option key={style.value} value={style.value}>{style.label}</option>
      ))}
    </select>
  );
}
