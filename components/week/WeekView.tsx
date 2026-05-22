"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Chip";
import { BigNum } from "@/components/ui/Stats";
import { clsx } from "@/lib/clsx";
import { useApp } from "@/lib/store";
import type { DaySummary } from "@/lib/types";

const KIND_META: Record<DaySummary["kind"], { color: string; bg: string; label: string }> = {
  deficit:       { color: "var(--primary)", bg: "var(--primary-soft)", label: "Déficit" },
  mantenimiento: { color: "var(--ink-2)",   bg: "var(--surface-2)",    label: "Mant." },
  entreno:       { color: "var(--accent)",  bg: "var(--accent-soft)",  label: "Entreno" },
  partido:       { color: "var(--carbs)",   bg: "rgba(201,163,88,0.18)", label: "Partido" },
};

export function WeekView() {
  const { weekData } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const avgKcal = useMemo(
    () => Math.round(weekData.reduce((s, d) => s + d.kcal, 0) / weekData.length),
    [weekData]
  );
  const avgProt = useMemo(
    () => Math.round(weekData.reduce((s, d) => s + d.protein, 0) / weekData.length),
    [weekData]
  );

  return (
    <div className="md:px-9 md:py-6">
      <div className="px-5 pt-4 pb-3 md:px-0 md:pt-0">
        <h1 className="font-extrabold text-[34px] leading-none tracking-[-0.03em]">Tu semana</h1>
      </div>

      {/* week navigator */}
      <div className="px-5 md:px-0 pb-3 flex items-center justify-between">
        <button className="w-9 h-9 rounded-sm border border-border bg-surface flex items-center justify-center text-ink" aria-label="Semana anterior">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-extrabold text-[18px] tracking-[-0.02em]">16 — 22 mayo</div>
          <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider mt-0.5">Semana actual</div>
        </div>
        <button className="w-9 h-9 rounded-sm border border-border bg-surface flex items-center justify-center text-ink" aria-label="Semana siguiente">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="px-5 md:px-0 pb-4">
        <Card padding={18} className="!bg-surface-2 !border-transparent">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Promedio diario</div>
          <div className="flex items-baseline gap-4 mt-2">
            <BigNum value={avgKcal.toLocaleString("es-AR")} unit="kcal" size={32} />
            <div className="tnum text-[13px] text-ink-2 font-semibold">· {avgProt} g proteína</div>
          </div>
        </Card>
      </div>

      <div className="px-5 md:px-0 flex flex-col gap-2">
        {weekData.map((d) => (
          <DayCard
            key={d.date}
            day={d}
            expanded={expanded === d.date}
            onToggle={() => setExpanded(expanded === d.date ? null : d.date)}
          />
        ))}
      </div>

      <div className="px-5 md:px-0 mt-6">
        <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Calorías por día</h2>
        <Card padding={20}>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600, fill: "var(--ink-3)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-2)" }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                    fontFamily: "var(--font-body)",
                  }}
                  formatter={(v: number) => [`${v.toLocaleString("es-AR")} kcal`, ""]}
                  labelStyle={{ color: "var(--ink-3)", fontWeight: 600 }}
                />
                <Bar dataKey="kcal" radius={[6, 6, 0, 0]}>
                  {weekData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={KIND_META[d.kind].color}
                      opacity={d.isToday ? 1 : 0.78}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DayCard({
  day, expanded, onToggle,
}: { day: DaySummary; expanded: boolean; onToggle: () => void }) {
  const meta = KIND_META[day.kind];
  return (
    <Card
      padding={14}
      onClick={onToggle}
      className={clsx(
        "cursor-pointer transition-colors",
        day.isToday && "!border-ink !border-2",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 text-center">
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">{day.dayLabel}</div>
          <div className="font-extrabold text-[24px] leading-none mt-0.5 tracking-[-0.035em]">{day.dayNum}</div>
        </div>
        <div className="w-px h-9 bg-border" />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="tnum font-extrabold text-[20px] tracking-[-0.035em]">
              {day.kcal.toLocaleString("es-AR")}
            </span>
            <span className="text-[11px] text-ink-3 font-semibold">kcal</span>
          </div>
          <div className="tnum text-xs text-ink-2 mt-0.5">
            {day.protein} g prot · {day.weight ? `${day.weight} kg` : "sin peso"}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge color={meta.color} bg={meta.bg}>{meta.label}</Badge>
          {day.workout !== "rest" && (
            <span className="text-ink-3">
              <Dumbbell size={14} />
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-2.5">
            Resumen del día
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <MiniStat label="Kcal" value={day.kcal.toLocaleString("es-AR")} />
            <MiniStat label="Prot" value={`${day.protein}g`} />
            <MiniStat label="Entreno" value={day.workout === "rest" ? "Descanso" : day.workout} />
          </div>
          <button className="w-full border border-border-strong rounded-pill py-2 mt-3 text-ink-2 font-semibold text-[13px]">
            Ver comidas del día →
          </button>
        </div>
      )}
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">{label}</div>
      <div className="tnum font-extrabold text-[18px] mt-0.5 tracking-[-0.035em] capitalize">{value}</div>
    </div>
  );
}
