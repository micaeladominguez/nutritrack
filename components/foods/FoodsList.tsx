"use client";

import { useState } from "react";
import { Search, Plus, ChevronRight, Soup } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { FoodEditSheet } from "./FoodEditSheet";
import type { Food } from "@/lib/types";

export function FoodsList() {
  const { foods } = useApp();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = foods.filter(
    (f) =>
      !query ||
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.brand?.toLowerCase().includes(query.toLowerCase()) ?? false)
  );

  return (
    <div className="md:px-9 md:py-6">
      <div className="px-5 pt-4 pb-4 md:px-0 md:pt-0 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-[34px] leading-none tracking-[-0.03em]">Mis alimentos</h1>
          <div className="text-[13px] text-ink-2 mt-1.5">{foods.length} en tu biblioteca</div>
        </div>
          <Button
              onClick={() => setEditingId("new")}
              variant="primary"
              className="hidden md:inline-flex h-11 rounded-2xl px-5 gap-2"
          >
              <Plus size={16} />
              Agregar alimento
          </Button>
      </div>

      <div className="px-5 md:px-0 pb-3">
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar alimento"
          icon={<Search size={18} />}
        />
      </div>

      <div className="px-5 md:px-0 pb-3 md:hidden">
        <Button variant="secondary" full onClick={() => setEditingId("new")}>
          <Plus size={16} /> Agregar alimento
        </Button>
      </div>

      <div className="px-5 md:px-0 flex flex-col gap-2">
        {filtered.map((f) => (
          <FoodRow key={f.id} food={f} onClick={() => setEditingId(f.id)} />
        ))}
      </div>

      <FoodEditSheet
        id={editingId}
        open={editingId !== null}
        onClose={() => setEditingId(null)}
      />
    </div>
  );
}

function FoodRow({ food, onClick }: { food: Food; onClick: () => void }) {
  return (
    <Card padding={14} onClick={onClick} className="cursor-pointer hover:border-ink/30 transition-colors flex items-center gap-3">
      <div className="w-9 h-9 rounded-sm bg-surface-2 text-ink-2 flex items-center justify-center shrink-0">
        <Soup size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-extrabold tracking-tight">{food.name}</div>
        <div className="tnum text-[12px] text-ink-3 mt-0.5 truncate">
          {food.kcal} kcal · {food.protein}g prot · {food.carbs}g carb · {food.fats}g gras
          {food.brand && ` · ${food.brand}`}
        </div>
      </div>
      <ChevronRight size={16} className="text-ink-3" />
    </Card>
  );
}
