"use client";

import { useMemo, useState } from "react";
import { Plus, BookOpen, ChevronRight, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { useApp } from "@/lib/store";
import { recipeMacrosPer100 } from "@/lib/macros";
import { RecipeEditor } from "./RecipeEditor";
import type { Recipe } from "@/lib/types";

export function RecipesList() {
  const { recipes, foods } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.name.toLowerCase().includes(normalizedQuery)),
    [normalizedQuery, recipes],
  );

  return (
    <div className="md:px-9 md:py-5 md:h-[calc(100vh-1px)] md:flex md:flex-col md:min-h-0">
      <div className="px-5 pt-4 pb-4 md:px-0 md:pt-0 flex items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-extrabold text-[34px] leading-none tracking-[-0.03em]">Mis recetas</h1>
          <div className="text-[13px] text-ink-2 mt-1.5">{recipes.length} guardadas</div>
        </div>
          <Button
              onClick={() => setEditingId("new")}
              variant="primary"
              className="hidden md:inline-flex h-11 rounded-2xl px-5 gap-2"
          >
              <Plus size={16} />
              Nueva receta
          </Button>
      </div>

      <div className="px-5 md:px-0 pb-3 shrink-0">
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar receta"
          icon={<Search size={18} />}
          className="h-11"
        />
      </div>

      <div className="px-5 md:px-0 pb-3 md:hidden shrink-0">
        <Button
          variant="primary"
          full
          onClick={() => setEditingId("new")}
          className="h-12 rounded-2xl gap-2"
        >
          <Plus size={16} /> Nueva receta
        </Button>
      </div>

      <div className="px-5 md:px-0 md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-5">
          {filteredRecipes.length === 0 ? (
            <Card padding={18} className="md:col-span-2 text-sm text-ink-2">
              No encontramos recetas con esa búsqueda.
            </Card>
          ) : (
            filteredRecipes.map((r) => (
              <RecipeRow
                key={r.id}
                recipe={r}
                onClick={() => setEditingId(r.id)}
                macros={recipeMacrosPer100(r, foods)}
              />
            ))
          )}
        </div>
      </div>

      <RecipeEditor
        id={editingId}
        open={editingId !== null}
        onClose={() => setEditingId(null)}
      />
    </div>
  );
}

function RecipeRow({
  recipe, onClick, macros,
}: { recipe: Recipe; onClick: () => void; macros: { kcal: number; protein: number; carbs: number; fats: number } }) {
  return (
    <Card padding={16} onClick={onClick} className="cursor-pointer hover:border-ink/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-sm bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <BookOpen size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold tracking-tight">{recipe.name}</div>
          <div className="tnum text-xs text-ink-3 mt-0.5">
            {recipe.ingredients.length} ingredientes · {recipe.unit === "unidad" ? "por unidad" : `${recipe.finalWeight} g totales`}
          </div>
        </div>
        <ChevronRight size={16} className="text-ink-3" />
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-border">
        <Stat label="kcal" value={Math.round(macros.kcal)} sub={recipe.unit === "unidad" ? "/unid." : "/100g"} />
        <Stat label="prot" value={macros.protein.toFixed(1)} sub="g" />
        <Stat label="carb" value={macros.carbs.toFixed(1)} sub="g" />
        <Stat label="gras" value={macros.fats.toFixed(1)} sub="g" />
      </div>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="tnum font-extrabold text-[18px] tracking-[-0.035em]">{value}</span>
        <span className="tnum text-[10px] text-ink-3 font-medium">{sub}</span>
      </div>
    </div>
  );
}
