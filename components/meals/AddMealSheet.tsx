"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, BookOpen, Soup, Plus, Minus, Sunrise, Sun, Coffee, Moon, Apple } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { TextInput, Field } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BigNum } from "@/components/ui/Stats";
import { useApp } from "@/lib/store";
import { macrosForFood, recipeMacrosPer100 } from "@/lib/macros";
import { MEAL_TYPES } from "@/lib/types";
import type { Food, Recipe, MealType } from "@/lib/types";

type SelectedItem =
  | { kind: "food"; item: Food }
  | { kind: "recipe"; item: Recipe };

const MEAL_ICONS: Record<MealType, typeof Sunrise> = {
  desayuno: Sunrise,
  almuerzo: Sun,
  merienda: Coffee,
  cena: Moon,
  snack: Apple,
};

export function AddMealSheet() {
  const { modal, closeModal, foods, recipes, addEntry } = useApp();
  const open = modal.kind === "add-meal";
  const initialMealType = open ? modal.mealType : "snack";

  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [grams, setGrams] = useState(100);

  // Reset internal state whenever the sheet opens for a new meal type.
  useEffect(() => {
    if (open) {
      setMealType(initialMealType);
      setQuery("");
      setSelected(null);
      setGrams(100);
    }
  }, [open, initialMealType]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchFood = (f: Food) =>
      !q || f.name.toLowerCase().includes(q) || (f.brand?.toLowerCase().includes(q) ?? false);
    const matchRecipe = (r: Recipe) => !q || r.name.toLowerCase().includes(q);

    const recipeResults: SelectedItem[] = recipes.filter(matchRecipe).map((r) => ({ kind: "recipe", item: r }));
    const foodResults: SelectedItem[] = foods.filter(matchFood).map((f) => ({ kind: "food", item: f }));
    return [...recipeResults, ...foodResults].slice(0, 40);
  }, [query, foods, recipes]);

  const baseMacros = useMemo(() => {
    if (!selected) return null;
    if (selected.kind === "food") return macrosForFood(selected.item, 100);
    return recipeMacrosPer100(selected.item, foods);
  }, [selected, foods]);

  const preview = baseMacros && {
    kcal: (baseMacros.kcal * grams) / 100,
    protein: (baseMacros.protein * grams) / 100,
    carbs: (baseMacros.carbs * grams) / 100,
    fats: (baseMacros.fats * grams) / 100,
  };

  const save = () => {
    if (!selected || !baseMacros) return;
    const gramsNum = Number(grams) || 100;
    const r = gramsNum / 100;
    addEntry(
      {
        mealType,
        foodId: selected.kind === "food" ? selected.item.id : null,
        recipeId: selected.kind === "recipe" ? selected.item.id : null,
        grams: gramsNum,
      },
      {
        kcal: baseMacros.kcal * r,
        protein: baseMacros.protein * r,
        carbs: baseMacros.carbs * r,
        fats: baseMacros.fats * r,
        fiber: (baseMacros.fiber ?? 0) * r,
      }
    );
    closeModal();
  };

  return (
    <Sheet
      open={open}
      onClose={closeModal}
      title="Agregar comida"
      footer={
        <Button size="lg" full onClick={save} disabled={!selected}>
          {selected && preview
            ? `Guardar · ${Math.round(preview.kcal)} kcal`
            : "Elegí un alimento"}
        </Button>
      }
    >
      {/* meal type chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
        {MEAL_TYPES.map((mt) => {
          const Icon = MEAL_ICONS[mt.id];
          return (
            <Chip
              key={mt.id}
              active={mealType === mt.id}
              onClick={() => setMealType(mt.id)}
              icon={<Icon size={14} />}
            >
              {mt.label}
            </Chip>
          );
        })}
      </div>

      {/* search */}
      <div className="px-5 pb-3">
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar alimento o receta"
          icon={<Search size={18} />}
          autoFocus
        />
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2">
        {!selected ? (
          results.length === 0 ? (
            <div className="p-8 text-center text-ink-3 text-sm">
              Sin resultados. Probá con otra palabra o agregalo en "Mis alimentos".
            </div>
          ) : (
            results.map((r) => (
              <ResultRow
                key={r.kind + r.item.id}
                result={r}
                allFoods={foods}
                onPick={() => setSelected(r)}
              />
            ))
          )
        ) : (
          <SelectedView
            selected={selected}
            grams={grams}
            setGrams={setGrams}
            preview={preview!}
            baseMacros={baseMacros!}
            onClear={() => { setSelected(null); setQuery(""); }}
          />
        )}
      </div>
    </Sheet>
  );
}

function ResultRow({
  result, allFoods, onPick,
}: { result: SelectedItem; allFoods: Food[]; onPick: () => void }) {
  const Icon = result.kind === "recipe" ? BookOpen : Soup;
  const macros =
    result.kind === "food"
      ? { kcal: result.item.kcal, protein: result.item.protein }
      : recipeMacrosPer100(result.item, allFoods);

  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-sm hover:bg-surface-2"
    >
      <div
        className={
          "w-9 h-9 rounded-sm flex items-center justify-center shrink-0 " +
          (result.kind === "recipe" ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2")
        }
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">{result.item.name}</span>
          {result.kind === "recipe" && (
            <span className="text-[9px] font-bold px-1.5 py-px rounded bg-accent-soft text-accent tracking-wide">
              RECETA
            </span>
          )}
        </div>
        <div className="tnum text-xs text-ink-3 mt-0.5">
          {Math.round(macros.kcal)} kcal · {macros.protein.toFixed(1)} g prot · 100g
          {result.kind === "food" && result.item.brand && ` · ${result.item.brand}`}
        </div>
      </div>
    </button>
  );
}

function SelectedView({
  selected, grams, setGrams, preview, baseMacros, onClear,
}: {
  selected: SelectedItem;
  grams: number;
  setGrams: (g: number) => void;
  preview: { kcal: number; protein: number; carbs: number; fats: number };
  baseMacros: { kcal: number; protein: number };
  onClear: () => void;
}) {
  const Icon = selected.kind === "recipe" ? BookOpen : Soup;
  return (
    <div className="px-2 pb-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={
            "w-11 h-11 rounded-sm flex items-center justify-center " +
            (selected.kind === "recipe" ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2")
          }
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base">{selected.item.name}</div>
          <div className="tnum text-xs text-ink-3">
            Cada 100 g · {Math.round(baseMacros.kcal)} kcal · {baseMacros.protein.toFixed(1)} g prot
          </div>
        </div>
        <button type="button" onClick={onClear} className="text-ink-3 p-1.5" aria-label="Cambiar">
          <X size={18} />
        </button>
      </div>

      <Field label="Cantidad">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGrams(Math.max(0, grams - 25))}
            className="w-11 h-12 rounded-sm border border-border-strong bg-surface flex items-center justify-center text-ink shrink-0"
            aria-label="Restar 25 g"
          >
            <Minus size={16} />
          </button>
          <TextInput
            value={String(grams)}
            onChange={(v) => setGrams(Number(v.replace(/\D/g, "")) || 0)}
            inputMode="numeric"
            suffix="g"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setGrams(grams + 25)}
            className="w-11 h-12 rounded-sm border border-border-strong bg-surface flex items-center justify-center text-ink shrink-0"
            aria-label="Sumar 25 g"
          >
            <Plus size={16} />
          </button>
        </div>
      </Field>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {[50, 100, 150, 200, 300].map((p) => (
          <Chip key={p} onClick={() => setGrams(p)}>{p} g</Chip>
        ))}
      </div>

      <Card padding={16} className="mt-5 !bg-surface-2 !border-border">
        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-2">Aporte</div>
        <BigNum value={Math.round(preview.kcal)} unit="kcal" size={38} />
        <div className="grid grid-cols-3 gap-3 mt-3">
          <PreviewMacro label="Prot." value={preview.protein.toFixed(1)} color="var(--protein)" />
          <PreviewMacro label="Carbs" value={preview.carbs.toFixed(1)} color="var(--carbs)" />
          <PreviewMacro label="Grasas" value={preview.fats.toFixed(1)} color="var(--fats)" />
        </div>
      </Card>
    </div>
  );
}

function PreviewMacro({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">{label}</span>
      </div>
      <div className="tnum font-extrabold text-[22px] tracking-[-0.035em] mt-0.5">
        {value}<span className="text-[11px] text-ink-3 ml-0.5 font-medium">g</span>
      </div>
    </div>
  );
}
