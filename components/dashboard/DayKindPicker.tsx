"use client";

import { clsx } from "@/lib/clsx";
import { DAY_KINDS } from "@/lib/types";
import type { DayKind } from "@/lib/types";

interface Props {
  value: DayKind;
  onChange: (k: DayKind) => void;
}

export function DayKindPicker({ value, onChange }: Props) {
  return (
    <div className="inline-flex bg-surface-2 rounded-pill p-[3px]">
      {DAY_KINDS.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          className={clsx(
            "px-3 py-1.5 rounded-pill text-[12px] font-semibold transition-all",
            value === d.id
              ? "bg-surface text-ink shadow-1"
              : "text-ink-2",
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
