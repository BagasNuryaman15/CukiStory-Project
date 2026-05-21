"use client";

import type {ImageEffect} from "@/lib/types";
import {imageEffects} from "@/lib/presets";

export function EffectPicker({value, onChange}: {value: ImageEffect; onChange: (value: ImageEffect) => void}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as ImageEffect)} className="studio-input w-full rounded-xl px-3 py-2 text-sm">
      {imageEffects.map((effect) => (
        <option key={effect.value} value={effect.value}>{effect.label}</option>
      ))}
    </select>
  );
}
