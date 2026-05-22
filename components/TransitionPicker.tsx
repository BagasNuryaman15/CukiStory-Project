"use client";

import {transitions} from "@/lib/presets";
import type {TransitionType} from "@/lib/types";

export function TransitionPicker({value, onChange, disabled = false}: {value: TransitionType; onChange: (value: TransitionType) => void; disabled?: boolean}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as TransitionType)}
      className="studio-input w-full rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-55"
    >
      {transitions.map((transition) => (
        <option key={transition.value} value={transition.value}>{transition.label}</option>
      ))}
    </select>
  );
}
