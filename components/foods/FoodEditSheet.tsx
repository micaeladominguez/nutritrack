"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Field, TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useApp } from "@/lib/store";
import type { Food, Unit } from "@/lib/types";

interface Props {
  id: string | null;
  open: boolean;
  onClose: () => void;
}

type FoodForm = Omit<Food, "id" | "kcal" | "protein" | "carbs" | "fats" | "fiber"> & {
  kcal: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
};

const BLANK: FoodForm = {
  name: "", brand: null,
  kcal: "", protein: "", carbs: "", fats: "", fiber: "",
  unit: "g",
};

const numberToInput = (value: number) => String(value).replace(".", ",");
const parseDecimal = (value: string) => Number(value.replace(",", ".")) || 0;
const cleanDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d,.]/g, "").replace(/\./g, ",");
  const [first, ...rest] = cleaned.split(",");
  return rest.length ? `${first},${rest.join("")}` : first;
};

export function FoodEditSheet({ id, open, onClose }: Props) {
  const { foods, addFood, updateFood, removeFood } = useApp();
  const existing = id && id !== "new" ? foods.find((f) => f.id === id) : null;

  const [form, setForm] = useState<FoodForm>(BLANK);
  const baseUnitLabel = form.unit === "unidad" ? "1 unidad" : `100 ${form.unit}`;

  useEffect(() => {
    if (open) {
      setForm(existing
        ? {
            ...existing,
            kcal: numberToInput(existing.kcal),
            protein: numberToInput(existing.protein),
            carbs: numberToInput(existing.carbs),
            fats: numberToInput(existing.fats),
            fiber: numberToInput(existing.fiber),
          }
        : { ...BLANK });
    }
  }, [open, existing]);

  const setField = <K extends keyof FoodForm>(k: K, v: FoodForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setMacroField = (key: "kcal" | "protein" | "carbs" | "fats" | "fiber", value: string) =>
    setField(key, cleanDecimalInput(value));

  const save = () => {
    if (!form.name || !parseDecimal(form.kcal)) return;
    const payload = {
      ...form,
      brand: form.brand || null,
      kcal: parseDecimal(form.kcal),
      protein: parseDecimal(form.protein),
      carbs: parseDecimal(form.carbs),
      fats: parseDecimal(form.fats),
      fiber: parseDecimal(form.fiber),
    };
    if (existing) updateFood(existing.id, payload);
    else addFood(payload);
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    removeFood(existing.id);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={existing ? "Editar alimento" : "Nuevo alimento"}
      footer={
        <div className="flex items-center gap-2">
          {existing && (
            <Button variant="danger" onClick={remove}>
              <Trash2 size={16} /> Eliminar
            </Button>
          )}
          <Button size="lg" full={!existing} className={existing ? "flex-1" : undefined} onClick={save}>
            Guardar
          </Button>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        <Field label="Nombre">
          <TextInput value={form.name} onChange={(v) => setField("name", v)} placeholder="Pollo a la plancha" />
        </Field>
        <Field label="Marca (opcional)">
          <TextInput value={form.brand ?? ""} onChange={(v) => setField("brand", v || null)} placeholder="—" />
        </Field>

        <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 mt-1">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">
            Valores nutricionales por {baseUnitLabel}
          </div>
          <p className="text-sm text-ink-2 leading-relaxed mt-1">
            Cargá las kcal y macros de referencia. Ejemplo: si la pechuga cocida tiene
            165 kcal cada 100 g, escribí 165 en kcal.
          </p>
          <p className="text-xs text-ink-3 leading-relaxed mt-2">
            Este alimento queda en la base compartida. Las recetas siguen siendo solo tuyas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kcal">
            <TextInput value={form.kcal} onChange={(v) => setMacroField("kcal", v)} suffix="kcal" inputMode="decimal" />
          </Field>
          <Field label="Proteína">
            <TextInput value={form.protein} onChange={(v) => setMacroField("protein", v)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Carbohidratos">
            <TextInput value={form.carbs} onChange={(v) => setMacroField("carbs", v)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Grasas">
            <TextInput value={form.fats} onChange={(v) => setMacroField("fats", v)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Fibra (opcional)">
            <TextInput value={form.fiber} onChange={(v) => setMacroField("fiber", v)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Unidad">
            <div className="flex gap-1.5 mt-0.5">
              {(["g", "ml", "unidad"] as Unit[]).map((u) => (
                <Chip key={u} active={form.unit === u} onClick={() => setField("unit", u)}>{u}</Chip>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </Sheet>
  );
}
