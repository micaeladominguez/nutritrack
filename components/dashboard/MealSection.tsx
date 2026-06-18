"use client";

import { useState } from "react";
import { ChevronDown, Plus, X, Sunrise, Sun, Coffee, Moon, Apple } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const hasEntries = entries.length > 0;
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
    <section className="border-t first:border-t-0 border-border px-4 py-3">
      <header className="flex items-center gap-3" style={{ marginBottom: hasEntries && expanded ? 8 : 0 }}>
        <button
          type="button"
          onClick={() => hasEntries && setExpanded((value) => !value)}
          className="flex flex-1 min-w-0 items-center gap-3 text-left"
          aria-expanded={hasEntries ? expanded : undefined}
          aria-controls={hasEntries ? `meal-${mealType}-entries` : undefined}
        >
          <div className="w-8 h-8 rounded-sm bg-surface-2 text-ink-2 flex items-center justify-center shrink-0">
            <Icon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold tracking-tight">{label}</div>
            <div className="tnum text-xs text-ink-3 mt-0.5">
              {hasEntries
                ? `${entries.length} ${entries.length === 1 ? "item" : "items"} · ${Math.round(totals.kcal)} kcal · ${Math.round(totals.protein)} g prot.`
                : "Sin registrar"}
            </div>
          </div>
          {hasEntries && (
            <ChevronDown
              size={16}
              className={`text-ink-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => openAddMeal(mealType)}
          className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-ink"
          aria-label={`Agregar a ${label}`}
        >
          <Plus size={16} />
        </button>
      </header>

      {hasEntries && expanded && (
        <div id={`meal-${mealType}-entries`} className="ml-11 flex flex-col rounded-sm bg-surface-2/60 overflow-hidden">
          {entries.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              onRemove={() => removeEntry(e.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EntryRow({ entry, onRemove }: { entry: MealEntry; onRemove: () => void }) {
  const { foods, recipes } = useApp();
  const m = macrosForEntry(entry, foods, recipes);
  const food = entry.foodId ? foods.find((f) => f.id === entry.foodId) : null;
  const amountUnit = food?.unit === "unidad" ? "unid." : "g";
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 border-t first:border-t-0 border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-ink truncate">{m.name}</span>
          {m.isRecipe && (
            <span className="text-[9px] font-bold px-1.5 py-px rounded bg-accent-soft text-accent tracking-wide">
              R
            </span>
          )}
        </div>
        <div className="tnum text-[10px] text-ink-3 mt-px">
          {entry.grams} {amountUnit} · {entry.time}
        </div>
      </div>
      <div className="text-right">
        <div className="tnum text-[13px] font-semibold">{Math.round(m.kcal)}</div>
        <div className="tnum text-[10px] text-ink-3">{Math.round(m.protein)} g</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-ink-4 hover:text-danger p-0.5"
        aria-label="Quitar"
      >
        <X size={13} />
      </button>
    </div>
  );
}
