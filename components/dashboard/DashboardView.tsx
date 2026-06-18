"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BigNum } from "@/components/ui/Stats";
import { useApp } from "@/lib/store";
import { sumEntries } from "@/lib/macros";
import { MEAL_TYPES } from "@/lib/types";
import type { MealType } from "@/lib/types";
import { MacroBar } from "./MacroBar";
import { WaterCard } from "./WaterCard";
import { MealSection } from "./MealSection";
import { NoteRow } from "./NoteRow";

export function DashboardView() {
  const {
    entries, foods, recipes, goals,
    water, setWater,
    notes, setNotes,
  } = useApp();

  const totals = useMemo(() => sumEntries(entries, foods, recipes), [entries, foods, recipes]);

  const maintenanceKcal = Math.round(goals.maintenanceKcal ?? goals.kcal);
  const deficitKcal = Math.round(goals.deficitKcal ?? goals.kcal);
  const consumedKcal = Math.round(totals.kcal);
  const caloriesToMaintenance = Math.max(0, maintenanceKcal - consumedKcal);

  const dayRange = useMemo(() => {
    if (consumedKcal === 0) {
      return {
        label: "Sin registros todavía",
        detail: "Cuando cargues comidas, te mostramos el rango del día.",
      };
    }

    if (consumedKcal < deficitKcal) {
      return {
        label: "Por debajo del déficit",
        detail: "Quedaste debajo de tu rango de déficit. Es solo una lectura del día.",
      };
    }

    if (consumedKcal <= maintenanceKcal) {
      return {
        label: "Entre déficit y mantenimiento",
        detail: "Te mantuviste dentro del rango planificado para hoy.",
      };
    }

    return {
      label: "Por encima de mantenimiento",
      detail: "Pasaste tu referencia de mantenimiento. Mañana se vuelve a mirar de cero.",
    };
  }, [consumedKcal, deficitKcal, maintenanceKcal]);

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
      <div className="px-5 pt-4 pb-2 md:px-0 md:pt-0 md:pb-6">
        <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center md:flex md:items-center md:justify-between">
          <button className="w-9 h-9 rounded-full md:rounded-sm border border-border bg-surface flex items-center justify-center text-ink" aria-label="Día anterior">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center md:flex md:flex-col md:text-left">
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.1em]">{dayLabel}</div>
            <div className="font-extrabold text-[22px] md:text-[26px] tracking-[-0.03em] leading-tight md:mt-0.5">{dateLabel}</div>
          </div>
          <button className="w-9 h-9 rounded-full md:rounded-sm border border-border bg-surface flex items-center justify-center text-ink justify-self-end" aria-label="Día siguiente">
            <ChevronRight size={18} />
          </button>
          <div className="hidden md:flex items-center gap-2.5 text-xs font-semibold text-ink-3 ml-auto">
            Sin juicio, solo datos
          </div>
        </div>
      </div>

      <div className="px-5 md:px-0 pb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card padding={14} className="bg-surface">
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Consumido</div>
          <BigNum value={consumedKcal.toLocaleString("es-AR")} unit="kcal" size={26} className="mt-1" />
          <div className="text-[11px] text-ink-2 mt-1 truncate">{dayRange.label}</div>
        </Card>
        <Card padding={12} className="bg-surface">
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Mantenimiento</div>
          <BigNum value={maintenanceKcal.toLocaleString("es-AR")} unit="kcal" size={24} className="mt-1" />
        </Card>
        <Card padding={12} className="bg-surface">
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Déficit</div>
          <BigNum value={deficitKcal.toLocaleString("es-AR")} unit="kcal" size={24} className="mt-1" />
        </Card>
        <WaterCard value={water} goal={goals.water} onChange={setWater} compact />
      </div>

      {/* Responsive 2-col layout on md+ */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_390px] md:gap-5">
        {/* Left col */}
        <div className="flex flex-col gap-5">

          {/* Meals */}
          <div className="px-5 md:px-0">
            <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Comidas</h2>
            <Card padding={0} className="overflow-hidden">
              {MEAL_TYPES.map((mt) => (
                <MealSection
                  key={mt.id}
                  mealType={mt.id}
                  label={mt.label}
                  entries={byMeal[mt.id]}
                />
              ))}
            </Card>
          </div>

        </div>

        {/* Right col */}
        <div className="px-5 md:px-0 flex flex-col gap-4">
          <Card padding={18}>
            <div className="rounded-lg bg-surface-2 border border-border p-3.5">
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Rango de hoy</div>
              <div className="font-extrabold text-[18px] tracking-tight mt-1">{dayRange.label}</div>
              <p className="text-sm text-ink-2 leading-relaxed mt-1">{dayRange.detail}</p>
              <p className="text-xs text-ink-3 mt-2">
                Faltan {caloriesToMaintenance.toLocaleString("es-AR")} kcal para mantenimiento
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <MacroBar label="Proteína" value={totals.protein} goal={goals.protein} unit="g" color="var(--protein)" />
              <MacroBar label="Carbos" value={totals.carbs} goal={goals.carbs} unit="g" color="var(--carbs)" />
              <MacroBar label="Grasas" value={totals.fats} goal={goals.fats} unit="g" color="var(--fats)" />
            </div>
          </Card>

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
