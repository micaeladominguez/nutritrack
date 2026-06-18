"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, CalendarIcon } from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { BigNum } from "@/components/ui/Stats";
import { clsx } from "@/lib/clsx";
import { useApp } from "@/lib/store";

type MetricKey = "weight" | "waist" | "hips" | "thigh" | "arm" | "underbust";

interface Metric {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
}

const METRICS: Metric[] = [
  { key: "weight", label: "Peso", unit: "kg", color: "var(--primary)" },
  { key: "waist", label: "Cintura", unit: "cm", color: "var(--accent)" },
  { key: "hips", label: "Cadera", unit: "cm", color: "var(--carbs)" },
  { key: "thigh", label: "Pierna", unit: "cm", color: "var(--fats)" },
  { key: "arm", label: "Brazo", unit: "cm", color: "var(--water)" },
  { key: "underbust", label: "Debajo del busto", unit: "cm", color: "var(--ink-2)" },
];

const todayInputDate = () => new Date().toISOString().slice(0, 10);

export function WeightView() {
  const { measurements, addMeasurement } = useApp();

  const latest = measurements.length > 0 ? measurements[0] : null;
  const prev = measurements.length > 1 ? measurements[1] : null;

  const [selected, setSelected] = useState<MetricKey>("weight");
  const [date, setDate] = useState(todayInputDate());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [form, setForm] = useState<Partial<Record<MetricKey, string>>>({});

  const m = METRICS.find((x) => x.key === selected)!;

  const selectedDate = date ? new Date(`${date}T00:00:00`) : undefined;

  const onSave = () => {
    addMeasurement({
      date,
      weight: Number(form.weight ?? latest?.weight ?? 0),
      waist: Number(form.waist ?? latest?.waist ?? 0),
      hips: Number(form.hips ?? latest?.hips ?? 0),
      thigh: Number(form.thigh ?? latest?.thigh ?? 0),
      arm: Number(form.arm ?? latest?.arm ?? 0),
      underbust: Number(form.underbust ?? latest?.underbust ?? 0),
    });

    setForm({});
    setDate(todayInputDate());
    setIsDatePickerOpen(false);
  };

  const chartData = [...measurements].reverse().map((d) => ({
    date: new Date(d.date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    }),
    value: d[selected],
  }));

  return (
    <div className="md:px-9 md:py-6">
      <div className="px-5 pt-4 pb-4 md:px-0 md:pt-0">
        <h1 className="font-extrabold text-[34px] leading-none tracking-[-0.03em]">
          Peso y medidas
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-2">
          Un tablero tranquilo para mirar tendencia, no para perseguir un número aislado.
        </p>
      </div>

      <div className="grid gap-5 px-5 md:px-0 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
            <Card padding={22} className="!bg-surface-2 !border-transparent">
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">Último peso</div>
              <BigNum
                value={latest?.weight != null ? latest.weight.toFixed(1) : "—"}
                unit="kg"
                size={52}
                className="mt-3"
              />
              <div className="text-xs text-ink-3 mt-2">
                {latest?.date
                  ? new Date(latest.date).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "Sin registros todavía"}
              </div>
              {prev?.weight != null && latest?.weight != null && (
                <div className="mt-5">
                  <DeltaPill from={prev.weight} to={latest.weight} unit="kg" />
                </div>
              )}
            </Card>

            <Card padding={20}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">
                    {m.label} · tendencia
                  </div>
                  <BigNum
                    value={latest?.[m.key] != null ? Number(latest[m.key]).toFixed(1) : "—"}
                    unit={m.unit}
                    size={30}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {METRICS.map((x) => (
                    <button
                      key={x.key}
                      type="button"
                      onClick={() => setSelected(x.key)}
                      className={clsx(
                        "h-8 rounded-pill px-3 text-[12px] font-semibold transition-colors",
                        selected === x.key
                          ? "bg-primary text-on-primary"
                          : "bg-surface-2 text-ink-2 hover:text-ink",
                      )}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[220px] mt-3">
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
                      strokeWidth={2.5}
                      fill="url(#ng)"
                      dot={{ r: 2.5, fill: "var(--surface)", stroke: m.color, strokeWidth: 1.5 }}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="font-extrabold text-[22px] tracking-tight mb-3">Medidas actuales</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {METRICS.filter((metric) => metric.key !== "weight").map((metric) => (
                <MetricCard
                  key={metric.key}
                  metric={metric}
                  value={latest?.[metric.key] != null ? Number(latest[metric.key]) : null}
                  previous={prev?.[metric.key] != null ? Number(prev[metric.key]) : null}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Card padding={20}>
            <h2 className="font-extrabold text-[22px] tracking-tight mb-4">Registrar</h2>
            <div className="mb-4">
              <Field label="Fecha">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen((v) => !v)}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-ink flex items-center justify-between hover:border-primary transition"
                  >
                    <span>
                      {selectedDate
                        ? format(selectedDate, "d 'de' MMMM yyyy", { locale: es })
                        : "Seleccionar fecha"}
                    </span>
                    <CalendarIcon size={16} className="text-ink-3" />
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute left-0 top-[52px] z-50 rounded-2xl border border-border bg-surface p-3 shadow-2">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => {
                          if (!d) return;
                          setDate(format(d, "yyyy-MM-dd"));
                          setIsDatePickerOpen(false);
                        }}
                        locale={es}
                      />
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {METRICS.map((x) => (
                <Field key={x.key} label={x.label}>
                  <TextInput
                    value={form[x.key] ?? ""}
                    onChange={(v) => setForm({ ...form, [x.key]: v })}
                    suffix={x.unit}
                    inputMode="decimal"
                    placeholder={String(latest?.[x.key] ?? "")}
                  />
                </Field>
              ))}
            </div>

            <Button size="lg" full onClick={onSave} className="mt-4">
              Guardar medidas
            </Button>
            <p className="text-xs text-ink-3 text-center mt-3">
              Ideal: mismo día, mismo horario, sin desayunar.
            </p>
          </Card>

          <Card padding={0} className="overflow-hidden">
            <div className="px-4 py-4 border-b border-border">
              <h2 className="font-extrabold text-[20px] tracking-tight">Historial reciente</h2>
            </div>
            {measurements.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-ink-3">
                Todavía no registraste medidas.
              </div>
            ) : (
              measurements.slice(0, 6).map((d, i) => (
                <div
                  key={`${d.date}-${i}`}
                  className={clsx("px-4 py-3 flex items-center justify-between", i > 0 && "border-t border-border")}
                >
                  <div>
                    <div className="text-[13px] font-semibold">
                      {new Date(d.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                    </div>
                    <div className="tnum text-[11px] text-ink-3 mt-0.5">
                      cintura {d.waist} cm · cadera {d.hips} cm
                    </div>
                  </div>
                  <div className="tnum font-extrabold text-[22px] tracking-[-0.035em]">
                    {d.weight.toFixed(1)}
                    <span className="text-[11px] text-ink-3 ml-0.5 font-medium">kg</span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  metric,
  value,
  previous,
}: {
  metric: Metric;
  value: number | null;
  previous: number | null;
}) {
  return (
    <Card padding={16}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">{metric.label}</div>
          <div className="tnum mt-2 text-[28px] font-extrabold leading-none tracking-[-0.035em]">
            {value != null ? value.toFixed(1) : "—"}
            <span className="ml-1 text-xs font-semibold text-ink-3">{metric.unit}</span>
          </div>
        </div>
        <div className="h-9 w-9 rounded-sm" style={{ backgroundColor: metric.color, opacity: 0.14 }} />
      </div>
      {previous != null && value != null && (
        <div className="mt-4">
          <DeltaPill from={previous} to={value} unit={metric.unit} small />
        </div>
      )}
    </Card>
  );
}

function DeltaPill({
                     from,
                     to,
                     unit,
                     small,
                   }: {
  from: number;
  to: number;
  unit: string;
  small?: boolean;
}) {
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
