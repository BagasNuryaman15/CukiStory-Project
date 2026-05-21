"use client";

import type {TransitionType} from "@/lib/types";
import {transitions} from "@/lib/presets";

export function TransitionPicker({value, onChange}: {value: TransitionType; onChange: (value: TransitionType) => void}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as TransitionType)} className="studio-input w-full rounded-xl px-3 py-2 text-sm">
      {transitions.map((transition) => (
        <option key={transition.value} value={transition.value}>{transition.label}</option>
      ))}
    </select>
  );
}
