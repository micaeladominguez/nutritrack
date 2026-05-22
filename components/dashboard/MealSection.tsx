"use client";

import { Plus, X, Sunrise, Sun, Coffee, Moon, Apple } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/lib/store";
import { macrosForEntry } from "@/lib/macros";
import type { MealEntry, MealType } from "@/lib/types";

const ICONS: Record<MealType, typeof Sunrise> = {
  desayuno: Sunrise,
  almuerzo: Sun,
  merienda: Coffee,
  cena: Moon,
  snack: Apple,
};

interface Props {
  mealType: MealType;
  label: string;
  entries: MealEntry[];
}

export function MealSection({ mealType, label, entries }: Props) {
  const { foods, recipes, removeEntry, openAddMeal } = useApp();
  const totals = entries.reduce(
    (acc, e) => {
      const m = macrosForEntry(e, foods, recipes);
      acc.kcal += m.kcal;
      acc.protein += m.protein;
      return acc;
    },
    { kcal: 0, protein: 0 }
  );
  const Icon = ICONS[mealType];

  return (
    <Card padding={16}>
      <header className="flex items-center gap-3" style={{ marginBottom: entries.length ? 12 : 0 }}>
        <div className="w-9 h-9 rounded-sm bg-surface-2 text-ink-2 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold tracking-tight">{label}</div>
          <div className="tnum text-xs text-ink-3 mt-0.5">
            {entries.length === 0
              ? "Sin registrar"
              : `${Math.round(totals.kcal)} kcal · ${Math.round(totals.protein)} g prot.`}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openAddMeal(mealType)}
          className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-ink"
          aria-label={`Agregar a ${label}`}
        >
          <Plus size={16} />
        </button>
      </header>

      {entries.length > 0 && (
        <div className="flex flex-col gap-2 pl-12">
          {entries.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              onRemove={() => removeEntry(e.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function EntryRow({ entry, onRemove }: { entry: MealEntry; onRemove: () => void }) {
  const { foods, recipes } = useApp();
  const m = macrosForEntry(entry, foods, recipes);
  return (
    <div className="flex items-center gap-2.5 py-2 border-t border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink truncate">{m.name}</span>
          {m.isRecipe && (
            <span className="text-[9px] font-bold px-1.5 py-px rounded bg-accent-soft text-accent tracking-wide">
              R
            </span>
          )}
        </div>
        <div className="tnum text-[11px] text-ink-3 mt-0.5">
          {entry.grams} g · {entry.time}
        </div>
      </div>
      <div className="text-right">
        <div className="tnum text-sm font-semibold">{Math.round(m.kcal)}</div>
        <div className="tnum text-[11px] text-ink-3">{Math.round(m.protein)} g</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-ink-4 hover:text-danger p-1"
        aria-label="Quitar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
