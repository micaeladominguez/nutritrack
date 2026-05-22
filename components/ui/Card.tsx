import { clsx } from "@/lib/clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
  children: ReactNode;
}

export function Card({ padding = 20, className, style, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={clsx("bg-surface border border-border rounded-md", className)}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
