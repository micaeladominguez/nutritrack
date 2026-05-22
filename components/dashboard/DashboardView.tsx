"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BigNum, Ring } from "@/components/ui/Stats";
import { useApp } from "@/lib/store";
import { sumEntries } from "@/lib/macros";
import { DAY_KINDS, MEAL_TYPES } from "@/lib/types";
import type { MealType } from "@/lib/types";
import { DayKindPicker } from "./DayKindPicker";
import { MacroBar } from "./MacroBar";
import { WaterCard } from "./WaterCard";
import { MealSection } from "./MealSection";
import { NoteRow } from "./NoteRow";

export function DashboardView() {
  const {
    entries, foods, recipes, goals,
    dayKind, setDayKind,
    water, setWater,
    notes, setNotes,
  } = useApp();

  const totals = useMemo(() => sumEntries(entries, foods, recipes), [entries, foods, recipes]);

  const dynamicGoals = useMemo(() => {
    const dk = DAY_KINDS.find((d) => d.id === dayKind);
    return { ...goals, kcal: dk?.kcal ?? goals.kcal };
  }, [goals, dayKind]);

  const byMeal = useMemo(() => {
    const map: Record<MealType, typeof entries> = {
      desayuno: [], almuerzo: [], merienda: [], cena: [], snack: [],
    };
    entries.forEach((e) => { if (map[e.mealType]) map[e.mealType].push(e); });
    return map;
  }, [entries]);

  const today = new Date();
  const dayName = today.toLocaleDateString("es-AR", { weekday: "long" });
  const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const dateLabel = today.toLocaleDateString("es-AR", { day: "numeric", month: "long" });

  return (
    <div className="md:px-9 md:py-6">
      {/* Date header */}
      <div className="px-5 pt-4 pb-2 md:px-0 md:pt-0 md:pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button className="w-9 h-9 rounded-full md:rounded-sm border border-border bg-surface flex items-center justify-center text-ink" aria-label="Día anterior">
            <ChevronLeft size={18} />
          </button>
          <div className="md:flex md:flex-col text-center md:text-left">
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.1em]">{dayLabel}</div>
            <div className="font-extrabold text-[22px] md:text-[26px] tracking-[-0.03em] leading-tight md:mt-0.5">{dateLabel}</div>
          </div>
          <button className="w-9 h-9 rounded-full md:rounded-sm border border-border bg-surface flex items-center justify-center text-ink" aria-label="Día siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2.5">
          <DayKindPicker value={dayKind} onChange={setDayKind} />
        </div>
      </div>

      {/* Day kind picker on mobile */}
      <div className="px-5 pb-4 flex justify-center md:hidden">
        <DayKindPicker value={dayKind} onChange={setDayKind} />
      </div>

      {/* Responsive 2-col layout on md+ */}
      <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-5">
        {/* Left col */}
        <div className="flex flex-col gap-5">
          {/* Hero */}
          <div className="px-5 md:px-0">
            <Card padding={24} className="md:!p-7">
              <div className="flex items-center gap-5 md:gap-7">
                <Ring value={totals.kcal} max={dynamicGoals.kcal} size={132} stroke={10} color="var(--kcal)">
                  <div className="tnum font-extrabold text-[30px] leading-[0.9] tracking-[-0.035em]">
                    {Math.round(totals.kcal).toLocaleString("es-AR")}
                  </div>
                  <div className="text-[11px] text-ink-3 mt-0.5 font-semibold">kcal</div>
                </Ring>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Quedan</div>
                  <BigNum
                    value={Math.max(0, Math.round(dynamicGoals.kcal - totals.kcal)).toLocaleString("es-AR")}
                    unit="kcal"
                    size={42}
                  />
                  <div className="text-xs text-ink-2 mt-1.5">
                    Objetivo {dynamicGoals.kcal.toLocaleString("es-AR")} kcal
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5">
                <MacroBar label="Proteína" value={totals.protein} goal={goals.protein} unit="g" color="var(--protein)" />
                <MacroBar label="Carbos" value={totals.carbs} goal={goals.carbs} unit="g" color="var(--carbs)" />
                <MacroBar label="Grasas" value={totals.fats} goal={goals.fats} unit="g" color="var(--fats)" />
              </div>
            </Card>
          </div>

          {/* Water on mobile only */}
          <div className="px-5 md:hidden">
            <WaterCard value={water} goal={goals.water} onChange={setWater} />
          </div>

          {/* Meals */}
          <div className="px-5 md:px-0">
            <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Comidas</h2>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
              {MEAL_TYPES.map((mt) => (
                <MealSection
                  key={mt.id}
                  mealType={mt.id}
                  label={mt.label}
                  entries={byMeal[mt.id]}
                />
              ))}
            </div>
          </div>

          {/* Notes on mobile */}
          <div className="px-5 md:hidden">
            <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Notas del día</h2>
            <Card padding={18}>
              <NoteRow label="Hambre" value={notes.hunger} onChange={(v) => setNotes({ ...notes, hunger: v })} />
              <div className="h-px bg-border my-3.5" />
              <NoteRow label="Energía" value={notes.energy} onChange={(v) => setNotes({ ...notes, energy: v })} />
              <div className="h-px bg-border my-3.5" />
              <div>
                <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-2">Digestión</div>
                <textarea
                  value={notes.digestion}
                  onChange={(e) => setNotes({ ...notes, digestion: e.target.value })}
                  placeholder="Cómo te sentís…"
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-ink min-h-[40px] leading-relaxed"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Right col (desktop) */}
        <div className="hidden md:flex flex-col gap-5">
          <WaterCard value={water} goal={goals.water} onChange={setWater} />

          <Card padding={18}>
            <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Notas</h2>
            <NoteRow label="Hambre" value={notes.hunger} onChange={(v) => setNotes({ ...notes, hunger: v })} />
            <div className="h-px bg-border my-3.5" />
            <NoteRow label="Energía" value={notes.energy} onChange={(v) => setNotes({ ...notes, energy: v })} />
            <div className="h-px bg-border my-3.5" />
            <textarea
              value={notes.digestion}
              onChange={(e) => setNotes({ ...notes, digestion: e.target.value })}
              placeholder="Cómo te sentís…"
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-ink min-h-[60px] leading-relaxed"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
