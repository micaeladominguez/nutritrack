"use client";

import { clsx } from "@/lib/clsx";
import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Bottom-sheet on mobile, centered modal on ≥md. Click outside to close.
 * Renders children full-height inside a column flex container — give your
 * content `<div className="flex-1 overflow-y-auto">…</div>` for the scrollable body.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Optional footer slot — sits below the scrollable body, doesn't scroll. */
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[rgba(20,19,15,0.4)] flex items-end md:items-center md:justify-center animate-fadein"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "w-full md:max-w-[480px] md:w-[480px] bg-surface flex flex-col animate-slideup",
          "max-h-[94vh] md:max-h-[85vh]",
          "rounded-t-[24px] md:rounded-md md:shadow-3"
        )}
      >
        {/* drag handle (mobile) */}
        <div className="flex justify-center pt-2.5 pb-1 md:hidden">
          <div className="w-9 h-1 rounded-full bg-border-strong" />
        </div>

        <header className="flex items-center justify-between px-5 py-3 md:py-4">
          <h3 className="text-[22px] font-extrabold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-[34px] h-[34px] rounded-full bg-surface-2 flex items-center justify-center text-ink"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 flex flex-col min-h-0">{children}</div>

        {footer && <div className="border-t border-border px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
