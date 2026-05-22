import { clsx } from "@/lib/clsx";
import type { ReactNode } from "react";

interface BigNumProps {
  value: string | number;
  unit?: string;
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Headline number. Manrope 800, very tight tracking — same style users
 * approved in the prototype. Use `color="var(--protein)"` etc. for tinted variants.
 */
export function BigNum({ value, unit, color, size = 56, className }: BigNumProps) {
  return (
    <div
      className={clsx("flex items-baseline gap-1.5 leading-[0.9]", className)}
      style={{ color }}
    >
      <span
        className="tnum font-extrabold"
        style={{ fontSize: size, letterSpacing: "-0.035em" }}
      >
        {value}
      </span>
      {unit && (
        <span
          className="font-medium text-ink-3"
          style={{ fontSize: size * 0.28, letterSpacing: "0.02em" }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}

interface ProgressProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  className?: string;
}

export function Progress({ value, max, color = "var(--ink)", height = 6, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={clsx("bg-surface-3 overflow-hidden", className)}
      style={{ height, borderRadius: height }}
    >
      <div
        className="h-full transition-[width] duration-500 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: height,
        }}
      />
    </div>
  );
}

interface RingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}

export function Ring({
  value, max,
  size = 140, stroke = 10,
  color = "var(--kcal)", track = "var(--surface-3)",
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = c * pct;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 500ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
