"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Field, TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { BigNum } from "@/components/ui/Stats";
import { clsx } from "@/lib/clsx";
import { useApp } from "@/lib/store";
import type { Measurement } from "@/lib/types";

type MetricKey = "weight" | "waist" | "hips" | "thigh" | "arm" | "underbust";

interface Metric { key: MetricKey; label: string; unit: string; color: string }

const METRICS: Metric[] = [
  { key: "weight",    label: "Peso",             unit: "kg", color: "var(--primary)" },
  { key: "waist",     label: "Cintura",          unit: "cm", color: "var(--accent)" },
  { key: "hips",      label: "Cadera",           unit: "cm", color: "var(--carbs)" },
  { key: "thigh",     label: "Pierna",           unit: "cm", color: "var(--fats)" },
  { key: "arm",       label: "Brazo",            unit: "cm", color: "var(--water)" },
  { key: "underbust", label: "Debajo del busto", unit: "cm", color: "var(--ink-2)" },
];

export function WeightView() {
  const { measurements, addMeasurement } = useApp();
  const latest = measurements[measurements.length - 1];
  const prev = measurements[measurements.length - 2];

  const [tab, setTab] = useState<"chart" | "log">("chart");
  const [selected, setSelected] = useState<MetricKey>("weight");
  const m = METRICS.find((x) => x.key === selected)!;

  const [form, setForm] = useState<Partial<Record<MetricKey, string>>>({});

  const onSave = () => {
    addMeasurement({
      weight:    Number(form.weight    ?? latest.weight),
      waist:     Number(form.waist     ?? latest.waist),
      hips:      Number(form.hips      ?? latest.hips),
      thigh:     Number(form.thigh     ?? latest.thigh),
      arm:       Number(form.arm       ?? latest.arm),
      underbust: Number(form.underbust ?? latest.underbust),
    });
    setForm({});
    setTab("chart");
  };

  const chartData = measurements.map((d) => ({
    date: new Date(d.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
    value: d[selected],
  }));

  return (
    <div className="md:px-9 md:py-6">
      <div className="px-5 pt-4 pb-3 md:px-0 md:pt-0">
        <h1 className="font-extrabold text-[34px] leading-none tracking-[-0.03em]">Peso y medidas</h1>
      </div>

      <div className="px-5 md:px-0 pb-4">
        <Card padding={20}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Último peso</div>
              <BigNum value={latest.weight.toFixed(1)} unit="kg" size={48} />
              <div className="text-xs text-ink-3 mt-1">
                {new Date(latest.date).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
              </div>
            </div>
            <DeltaPill from={prev.weight} to={latest.weight} unit="kg" />
          </div>
        </Card>
      </div>

      <div className="px-5 md:px-0 pb-4">
        <div className="flex bg-surface-2 rounded-pill p-1">
          {([{ id: "chart", l: "Gráficos" }, { id: "log", l: "Registrar" }] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex-1 h-9 rounded-pill text-[13px] font-semibold transition-all",
                tab === t.id ? "bg-surface text-ink shadow-1" : "text-ink-2",
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {tab === "chart" ? (
        <>
          <div className="no-scrollbar px-5 md:px-0 pb-4 flex gap-1.5 overflow-x-auto">
            {METRICS.map((x) => (
              <Chip key={x.key} active={selected === x.key} onClick={() => setSelected(x.key)}>{x.label}</Chip>
            ))}
          </div>

          <div className="px-5 md:px-0">
            <Card padding={20}>
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">
                    {m.label} · últimas 8 semanas
                  </div>
                  <BigNum value={measurements[measurements.length - 1][m.key].toFixed(1)} unit={m.unit} size={28} />
                </div>
                <DeltaPill
                  from={measurements[0][m.key]}
                  to={measurements[measurements.length - 1][m.key]}
                  unit={m.unit}
                  small
                />
              </div>

              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ng" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={m.color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--ink-3)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={["dataMin - 0.5", "dataMax + 0.5"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--ink-3)" }}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v} ${m.unit}`, m.label]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={m.color}
                      strokeWidth={2}
                      fill="url(#ng)"
                      dot={{ r: 2.5, fill: "var(--surface)", stroke: m.color, strokeWidth: 1.5 }}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="px-5 md:px-0 mt-5">
            <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Historial reciente</h2>
            <Card padding={0}>
              {measurements.slice().reverse().slice(0, 5).map((d, i) => (
                <div
                  key={d.date}
                  className={clsx(
                    "px-4 py-3 flex items-center justify-between",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <div>
                    <div className="text-[13px] font-semibold">
                      {new Date(d.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                    </div>
                    <div className="tnum text-[11px] text-ink-3 mt-0.5">
                      cintura {d.waist}cm · cadera {d.hips}cm
                    </div>
                  </div>
                  <div className="tnum font-extrabold text-[22px] tracking-[-0.035em]">
                    {d.weight.toFixed(1)}
                    <span className="text-[11px] text-ink-3 ml-0.5 font-medium">kg</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </>
      ) : (
        <div className="px-5 md:px-0">
          <Card padding={20}>
            <div className="grid grid-cols-2 gap-3">
              {METRICS.map((x) => (
                <Field key={x.key} label={x.label}>
                  <TextInput
                    value={form[x.key] ?? ""}
                    onChange={(v) => setForm({ ...form, [x.key]: v })}
                    suffix={x.unit}
                    inputMode="decimal"
                    placeholder={String(latest[x.key])}
                  />
                </Field>
              ))}
            </div>
            <Button size="lg" full onClick={onSave} className="mt-4">
              Guardar medidas
            </Button>
          </Card>
          <p className="text-xs text-ink-3 text-center mt-3">
            Lo ideal es medir mismo día, mismo horario, sin desayunar.
          </p>
        </div>
      )}
    </div>
  );
}

function DeltaPill({
  from, to, unit, small,
}: { from: number; to: number; unit: string; small?: boolean }) {
  const delta = to - from;
  const abs = Math.abs(delta);
  const isDown = delta < 0;
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-pill bg-surface-2 text-ink-2",
        small ? "px-2.5 py-1" : "px-3 py-1.5",
      )}
    >
      {isDown ? <ArrowDown size={small ? 12 : 14} /> : <ArrowUp size={small ? 12 : 14} />}
      <span className={clsx("tnum font-bold text-ink", small ? "text-[12px]" : "text-[13px]")}>
        {abs.toFixed(1)} {unit}
      </span>
    </div>
  );
}
