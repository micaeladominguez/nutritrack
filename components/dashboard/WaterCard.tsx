"use client";

import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {
  value: number;
  goal: number;
  onChange: (n: number) => void;
}

export function WaterCard({ value, goal, onChange }: Props) {
  const cups = 8;
  const cupMl = goal / cups;
  const filled = Math.floor(value / cupMl);

  return (
    <Card padding={18}>
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Agua</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="tnum font-extrabold text-[26px] tracking-[-0.03em]">
              {(value / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-ink-3 font-semibold">/ {(goal / 1000).toFixed(1)} L</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 250))}
            className="w-8 h-8 rounded-full bg-surface border border-border-strong flex items-center justify-center text-ink hover:bg-surface-2"
            aria-label="Quitar 250 ml"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.min(goal + 1000, value + 250))}
            className="w-8 h-8 rounded-full bg-primary text-on-primary border border-primary flex items-center justify-center"
            aria-label="Sumar 250 ml"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: cups }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[18px] rounded-[5px] transition-colors duration-200"
            style={{ backgroundColor: i < filled ? "var(--water)" : "var(--surface-3)" }}
          />
        ))}
      </div>
    </Card>
  );
}
