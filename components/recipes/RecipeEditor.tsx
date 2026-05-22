"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Search, ChevronLeft, Plus } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BigNum } from "@/components/ui/Stats";
import { useApp } from "@/lib/store";
import type { RecipeIngredient } from "@/lib/types";

interface Props {
  id: string | null;
  open: boolean;
  onClose: () => void;
}

export function RecipeEditor({ id, open, onClose }: Props) {
  const { recipes, foods, addRecipe, updateRecipe } = useApp();
  const existing = id && id !== "new" ? recipes.find((r) => r.id === id) : null;

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [finalWeight, setFinalWeight] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setName(existing?.name ?? "");
      setIngredients(existing?.ingredients ?? []);
      setFinalWeight(existing ? String(existing.finalWeight) : "");
      setNotes(existing?.notes ?? "");
      setPickerOpen(false);
    }
  }, [open, existing]);

  const totalIngWeight = ingredients.reduce((s, i) => s + (Number(i.grams) || 0), 0);

  const computed = useMemo(() => {
    let kcal = 0, protein = 0, carbs = 0, fats = 0;
    ingredients.forEach((ing) => {
      const food = foods.find((f) => f.id === ing.foodId);
      if (!food) return;
      const r = Number(ing.grams) / 100;
      kcal += food.kcal * r;
      protein += food.protein * r;
      carbs += food.carbs * r;
      fats += food.fats * r;
    });
    const fw = Number(finalWeight) || 0;
    if (fw <= 0) return null;
    const ratio = 100 / fw;
    return {
      kcal: kcal * ratio,
      protein: protein * ratio,
      carbs: carbs * ratio,
      fats: fats * ratio,
      totalKcal: kcal,
      totalProtein: protein,
    };
  }, [ingredients, finalWeight, foods]);

  const save = () => {
    const fw = Number(finalWeight);
    if (!name || ingredients.length === 0 || !fw) return;
    const payload = {
      name,
      ingredients: ingredients.map((i) => ({ foodId: i.foodId, grams: Number(i.grams) })),
      finalWeight: fw,
      notes,
    };
    if (existing) updateRecipe(existing.id, payload);
    else addRecipe(payload);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={existing ? "Editar receta" : "Nueva receta"}
      footer={<Button size="lg" full onClick={save}>Guardar receta</Button>}
    >
      <div className="flex-1 overflow-y-auto px-5 pb-4 relative">
        <Field label="Nombre">
          <TextInput value={name} onChange={setName} placeholder="Bowl de pollo y arroz" />
        </Field>

        <header className="flex items-center justify-between mt-5 mb-2">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Ingredientes</div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-accent font-semibold text-[13px] px-1 py-1"
          >
            + Agregar
          </button>
        </header>

        <div className="flex flex-col gap-2">
          {ingredients.map((ing, idx) => {
            const food = foods.find((f) => f.id === ing.foodId);
            if (!food) return null;
            return (
              <div key={idx} className="flex items-center gap-2.5 bg-surface-2 rounded-sm px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{food.name}</div>
                  <div className="tnum text-[11px] text-ink-3 mt-0.5">
                    {Math.round((food.kcal * Number(ing.grams)) / 100)} kcal
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ing.grams}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setIngredients((is) => is.map((x, i) => (i === idx ? { ...x, grams: Number(v) } : x)));
                  }}
                  className="w-16 text-right bg-surface rounded-xs px-2.5 py-1.5 text-[13px] font-semibold text-ink"
                />
                <span className="text-xs text-ink-3">g</span>
                <button
                  type="button"
                  onClick={() => setIngredients((is) => is.filter((_, i) => i !== idx))}
                  className="text-ink-3 p-1"
                  aria-label="Quitar ingrediente"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          {ingredients.length === 0 && (
            <div className="bg-surface-2 rounded-sm p-5 text-center text-ink-3 text-sm border border-dashed border-border-strong">
              Buscá tus alimentos y agregalos.
            </div>
          )}
        </div>

        <div className="mt-5">
          <Field
            label="Peso final de la receta cocida"
            hint={
              totalIngWeight > 0
                ? `Peso crudo: ${totalIngWeight.toFixed(0)} g. El cocido suele ser distinto por agua que pierde o gana.`
                : undefined
            }
          >
            <TextInput
              value={finalWeight}
              onChange={(v) => setFinalWeight(v.replace(/\D/g, ""))}
              inputMode="numeric"
              suffix="g"
            />
          </Field>
        </div>

        {computed && (
          <Card padding={18} className="mt-5 !bg-primary-soft !border-transparent">
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
              Cada 100 g de receta
            </div>
            <div className="flex items-baseline gap-2.5">
              <BigNum value={Math.round(computed.kcal)} unit="kcal" size={36} color="var(--primary)" />
              <span className="tnum text-[13px] text-primary font-semibold opacity-80">
                · {computed.protein.toFixed(1)} g prot
              </span>
            </div>
            <div className="tnum text-xs text-primary opacity-80 mt-2.5">
              Total: {Math.round(computed.totalKcal)} kcal · {computed.totalProtein.toFixed(0)} g prot · {finalWeight} g
            </div>
          </Card>
        )}

        <div className="mt-5">
          <Field label="Notas (opcional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cómo la preparás, qué condimentos…"
              className="w-full border border-border-strong rounded-sm p-3 text-sm text-ink min-h-[80px] leading-relaxed resize-y bg-surface"
            />
          </Field>
        </div>

        {pickerOpen && (
          <IngredientPicker
            onPick={(foodId) => {
              setIngredients((is) => [...is, { foodId, grams: 100 }]);
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
    </Sheet>
  );
}

function IngredientPicker({
  onPick, onClose,
}: { onPick: (foodId: string) => void; onClose: () => void }) {
  const { foods } = useApp();
  const [q, setQ] = useState("");
  const filtered = foods
    .filter((f) => !q || f.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 30);
  return (
    <div className="absolute inset-0 z-40 bg-surface flex flex-col animate-slideup">
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
        <button onClick={onClose} className="text-ink p-1.5" aria-label="Volver">
          <ChevronLeft size={20} />
        </button>
        <div className="font-bold text-base">Elegí un alimento</div>
      </div>
      <div className="px-5 pb-3">
        <TextInput value={q} onChange={setQ} placeholder="Buscar" icon={<Search size={18} />} autoFocus />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filtered.map((f) => (
          <button
            key={f.id}
            onClick={() => onPick(f.id)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-surface-2"
          >
            <div className="flex-1">
              <div className="font-semibold text-sm">{f.name}</div>
              <div className="tnum text-xs text-ink-3 mt-0.5">
                {f.kcal} kcal · {f.protein} g prot · 100 {f.unit}
              </div>
            </div>
            <Plus size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
