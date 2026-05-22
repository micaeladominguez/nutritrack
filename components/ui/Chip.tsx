"use client";

import { clsx } from "@/lib/clsx";
import type { ReactNode } from "react";

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Chip({ active, onClick, icon, className, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-[13px] font-semibold whitespace-nowrap",
        "border transition-all duration-150",
        active
          ? "bg-ink text-on-primary border-ink"
          : "bg-surface text-ink-2 border-border-strong hover:border-ink",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

interface BadgeProps {
  color?: string;
  bg?: string;
  className?: string;
  children: ReactNode;
}

export function Badge({ color, bg, className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-[11px] font-bold uppercase tracking-wider",
        className
      )}
      style={{
        backgroundColor: bg ?? "var(--surface-2)",
        color: color ?? "var(--ink)",
      }}
    >
      {children}
    </span>
  );
}
