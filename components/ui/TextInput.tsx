"use client";

import { clsx } from "@/lib/clsx";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> {
  value: string;
  onChange: (v: string) => void;
  icon?: ReactNode;
  suffix?: ReactNode;
  invalid?: boolean;
}

export function TextInput({
  value, onChange, icon, suffix, invalid, className, ...rest
}: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={clsx(
        "flex items-center bg-surface rounded-sm h-12 px-3.5",
        "border transition-colors",
        focused ? "border-ink" : invalid ? "border-danger" : "border-border-strong",
        className
      )}
    >
      {icon && <span className="mr-2.5 text-ink-3 flex">{icon}</span>}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-medium text-ink placeholder:text-ink-3"
      />
      {suffix && <span className="ml-2 text-ink-3 text-[13px]">{suffix}</span>}
    </div>
  );
}

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <label className={clsx("block", className)}>
      {label && (
        <div className="text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
      {(hint || error) && (
        <div className={clsx("text-xs mt-1.5", error ? "text-danger" : "text-ink-3")}>
          {error || hint}
        </div>
      )}
    </label>
  );
}
