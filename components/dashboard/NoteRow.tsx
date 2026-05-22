"use client";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function NoteRow({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[13px] font-semibold text-ink-2">{label}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={
              "w-7 h-7 rounded-full text-xs font-bold border transition-all " +
              (n <= value
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-2 text-ink-3 border-border")
            }
            aria-label={`${label}: ${n}`}
            aria-pressed={n === value}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
