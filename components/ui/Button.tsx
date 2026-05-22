"use client";

import { clsx } from "@/lib/clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  children: ReactNode;
}

const VARIANT = {
  primary: "bg-primary text-on-primary border-primary hover:bg-[var(--primary-hover)] active:scale-[0.98]",
  secondary: "bg-surface text-ink border-border-strong hover:bg-surface-2",
  ghost: "bg-transparent text-ink border-transparent hover:bg-surface-2",
  danger: "bg-transparent text-danger border-transparent hover:bg-danger-soft",
} satisfies Record<ButtonVariant, string>;

const SIZE = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-4.5 text-sm",
  lg: "h-[52px] px-5 text-[15px]",
} satisfies Record<ButtonSize, string>;

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-pill border font-semibold tracking-[-0.005em]",
        "transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
        VARIANT[variant],
        SIZE[size],
        full && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}
