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

const BLANK: Omit<Food, "id"> = {
  name: "", brand: null,
  kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0,
  unit: "g",
};

export function FoodEditSheet({ id, open, onClose }: Props) {
  const { foods, addFood, updateFood, removeFood } = useApp();
  const existing = id && id !== "new" ? foods.find((f) => f.id === id) : null;

  const [form, setForm] = useState<Omit<Food, "id">>(BLANK);

  useEffect(() => {
    if (open) setForm(existing ? { ...existing } : { ...BLANK });
  }, [open, existing]);

  const setField = <K extends keyof Omit<Food, "id">>(k: K, v: Omit<Food, "id">[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name || !form.kcal) return;
    const payload = {
      ...form,
      brand: form.brand || null,
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fats: Number(form.fats) || 0,
      fiber: Number(form.fiber) || 0,
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
        <div className="flex gap-2">
          {existing && (
            <Button variant="danger" onClick={remove}>
              <Trash2 size={16} /> Eliminar
            </Button>
          )}
          <Button size="lg" full onClick={save}>Guardar</Button>
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

        <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mt-1">Cada 100 g</div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kcal">
            <TextInput value={String(form.kcal || "")} onChange={(v) => setField("kcal", Number(v.replace(/[^\d.]/g, "")) || 0)} suffix="kcal" inputMode="decimal" />
          </Field>
          <Field label="Proteína">
            <TextInput value={String(form.protein || "")} onChange={(v) => setField("protein", Number(v.replace(/[^\d.]/g, "")) || 0)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Carbohidratos">
            <TextInput value={String(form.carbs || "")} onChange={(v) => setField("carbs", Number(v.replace(/[^\d.]/g, "")) || 0)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Grasas">
            <TextInput value={String(form.fats || "")} onChange={(v) => setField("fats", Number(v.replace(/[^\d.]/g, "")) || 0)} suffix="g" inputMode="decimal" />
          </Field>
          <Field label="Fibra (opcional)">
            <TextInput value={String(form.fiber || "")} onChange={(v) => setField("fiber", Number(v.replace(/[^\d.]/g, "")) || 0)} suffix="g" inputMode="decimal" />
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
