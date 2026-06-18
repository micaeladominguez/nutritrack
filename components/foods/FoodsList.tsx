"use client";

import { useEffect, useState } from "react";
import { Search, Plus, ChevronRight, Soup, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { getFoodsPage } from "@/lib/db";
import { FoodEditSheet } from "./FoodEditSheet";
import type { Food } from "@/lib/types";

const PAGE_SIZE = 10;

export function FoodsList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [foods, setFoods] = useState<Food[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [query]);

  useEffect(() => {
    let mounted = true;

    async function loadFoods() {
      setLoading(true);
      try {
        const data = await getFoodsPage(page, PAGE_SIZE, query);
        if (!mounted) return;
        setFoods(data.items);
        setTotalItems(data.totalItems);
        setTotalPages(Math.max(1, data.totalPages));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadFoods();
    return () => { mounted = false; };
  }, [page, query]);

  const refreshPage = async () => {
    const data = await getFoodsPage(page, PAGE_SIZE, query);
    setFoods(data.items);
    setTotalItems(data.totalItems);
    setTotalPages(Math.max(1, data.totalPages));
  };

  const closeEditor = () => {
    setEditingId(null);
    void refreshPage();
  };

  return (
    <div className="md:px-9 md:py-4 md:h-screen md:flex md:flex-col md:min-h-0">
      <div className="px-5 pt-4 pb-3 md:px-0 md:pt-0 flex items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-extrabold text-[31px] leading-none tracking-[-0.03em]">Base de alimentos</h1>
          <div className="text-[13px] text-ink-2 mt-1.5">{totalItems} alimentos compartidos</div>
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

      <div className="px-5 md:px-0 pb-3 shrink-0">
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar alimento"
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
          <Plus size={16} /> Agregar alimento
        </Button>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPrev={() => setPage((current) => Math.max(0, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
        className="px-5 md:px-0 pb-3 md:hidden shrink-0"
      />

      <div className="px-5 md:px-0 flex flex-col gap-1.5 md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1">
        {loading && (
          <Card padding={16} className="text-sm text-ink-2">
            Cargando alimentos...
          </Card>
        )}

        {!loading && foods.length === 0 && (
          <Card padding={16} className="text-sm text-ink-2">
            No encontramos alimentos con esa búsqueda.
          </Card>
        )}

        {!loading && foods.map((f) => (
          <FoodRow key={f.id} food={f} onClick={() => setEditingId(f.id)} />
        ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPrev={() => setPage((current) => Math.max(0, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
        className="hidden px-5 md:px-0 mt-3 md:flex shrink-0"
      />

      <FoodEditSheet
        id={editingId}
        open={editingId !== null}
        onClose={closeEditor}
      />
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  loading,
  onPrev,
  onNext,
  className,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={page === 0 || loading}
      >
        <ChevronLeft size={16} /> Anterior
      </Button>
      <div className="text-sm font-semibold text-ink-2">
        Página {page + 1} de {totalPages}
      </div>
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={page >= totalPages - 1 || loading}
      >
        Siguiente <ChevronRight size={16} />
      </Button>
    </div>
  );
}

function FoodRow({ food, onClick }: { food: Food; onClick: () => void }) {
  return (
    <Card padding={10} onClick={onClick} className="cursor-pointer hover:border-ink/30 transition-colors flex items-center gap-3">
      <div className="w-8 h-8 rounded-sm bg-surface-2 text-ink-2 flex items-center justify-center shrink-0">
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
