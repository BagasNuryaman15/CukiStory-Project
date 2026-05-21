"use client";

import {useState} from "react";
import {templates} from "@/lib/presets";

export function TemplatePicker({onApply}: {onApply: (templateId: string) => void}) {
  const [selected, setSelected] = useState(templates[0].id);
  const template = templates.find((item) => item.id === selected) ?? templates[0];

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-white">Global Template</h2>
          <p className="mt-1 text-sm text-studio-muted">Apply a default subtitle style, effects, and transitions to every scene.</p>
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="studio-input mt-4 w-full rounded-2xl px-4 py-3"
          >
            {templates.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <p className="mt-3 text-sm text-studio-muted">{template.description}</p>
        </div>
        <button
          onClick={() => onApply(selected)}
          className="btn-secondary px-5 py-3"
        >
          Apply Template to All Scenes
        </button>
      </div>
    </div>
  );
}
