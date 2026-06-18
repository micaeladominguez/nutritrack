"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, Ruler, Scale, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/TextInput";
import { useApp } from "@/lib/store";
import type { Goals, Measurement } from "@/lib/types";
import { clsx } from "@/lib/clsx";

type Sex = "female" | "male";
type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

const ACTIVITY: { id: ActivityLevel; label: string; factor: number; description: string }[] = [
  { id: "sedentary", label: "Baja", factor: 1.2, description: "Poco movimiento diario" },
  { id: "light", label: "Ligera", factor: 1.375, description: "2-3 entrenos o caminatas" },
  { id: "moderate", label: "Media", factor: 1.55, description: "3-5 entrenos por semana" },
  { id: "high", label: "Alta", factor: 1.725, description: "Entrenos fuertes o deporte frecuente" },
];

const MEASURE_FIELDS: { key: keyof Omit<Measurement, "date" | "weight">; label: string }[] = [
  { key: "waist", label: "Cintura" },
  { key: "hips", label: "Cadera" },
  { key: "thigh", label: "Pierna" },
  { key: "arm", label: "Brazo" },
  { key: "underbust", label: "Debajo busto" },
];

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function num(value: string) {
  return Number(value.replace(",", "."));
}

function calculateGoals(params: {
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityFactor: number;
}): Goals {
  const bmr = (10 * params.weight) + (6.25 * params.height) - (5 * params.age) + (params.sex === "male" ? 5 : -161);
  const maintenanceKcal = Math.round(bmr * params.activityFactor);
  const deficitKcal = Math.round(maintenanceKcal * 0.85);
  const protein = Math.round(params.targetWeight * 2);
  const fats = Math.round(params.targetWeight * 0.8);
  const carbs = Math.max(80, Math.round((deficitKcal - (protein * 4) - (fats * 9)) / 4));

  return {
    kcal: deficitKcal,
    maintenanceKcal,
    deficitKcal,
    targetWeight: params.targetWeight,
    protein,
    fats,
    carbs,
    water: Math.round(params.weight * 35),
    fiber: 30,
  };
}

export function OnboardingView() {
  const { addMeasurement, setGoals } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sex, setSex] = useState<Sex>("female");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [form, setForm] = useState({
    weight: "",
    targetWeight: "",
    height: "",
    age: "",
    waist: "",
    hips: "",
    thigh: "",
    arm: "",
    underbust: "",
  });

  const calculated = useMemo(() => {
    const weight = num(form.weight);
    const targetWeight = num(form.targetWeight);
    const height = num(form.height);
    const age = num(form.age);
    const activityFactor = ACTIVITY.find((item) => item.id === activity)?.factor ?? 1.55;

    if (!weight || !targetWeight || !height || !age) return null;
    return calculateGoals({ sex, age, height, weight, targetWeight, activityFactor });
  }, [activity, form.age, form.height, form.targetWeight, form.weight, sex]);

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateStep() {
    setError(null);
    if (step === 0) {
      if (!num(form.weight) || !num(form.targetWeight) || !num(form.height) || !num(form.age)) {
        setError("Completá peso, objetivo, altura y edad.");
        return false;
      }
    }
    if (step === 1) {
      const missing = MEASURE_FIELDS.some((field) => !num(form[field.key]));
      if (missing) {
        setError("Completá todas las medidas para tener una línea base.");
        return false;
      }
    }
    return true;
  }

  async function next() {
    if (!validateStep()) return;
    setStep((current) => Math.min(2, current + 1));
  }

  async function finish() {
    if (!calculated) return;
    setSaving(true);
    setError(null);
    try {
      await addMeasurement({
        date: today(),
        weight: num(form.weight),
        waist: num(form.waist),
        hips: num(form.hips),
        thigh: num(form.thigh),
        arm: num(form.arm),
        underbust: num(form.underbust),
      });
      await setGoals(calculated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el onboarding.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-5 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 md:mb-8">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.16em]">Primer setup</div>
          <h1 className="mt-2 text-[34px] md:text-[44px] font-extrabold tracking-[-0.04em] leading-none">
            Armemos tu base
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-ink-2">
            Guardamos tu peso, medidas y calorías iniciales para que el dashboard arranque con objetivos reales.
          </p>
        </div>

        <div className="mb-5 flex gap-2">
          {["Datos", "Medidas", "Calorías"].map((label, index) => (
            <div
              key={label}
              className={clsx(
                "h-2 flex-1 rounded-full",
                index <= step ? "bg-primary" : "bg-surface-3",
              )}
            />
          ))}
        </div>

        <Card padding={0} className="overflow-hidden">
          {step === 0 && (
            <div className="grid gap-6 p-5 md:grid-cols-[1fr_0.9fr] md:p-8">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-primary-soft text-primary">
                  <Scale size={22} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Peso y datos para calcular</h2>
                <p className="mt-2 text-sm text-ink-2">
                  Para estimar mantenimiento usamos edad, altura, sexo y actividad. Después podés ajustar todo.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="Peso actual">
                    <TextInput value={form.weight} onChange={(v) => setField("weight", v)} inputMode="decimal" suffix="kg" />
                  </Field>
                  <Field label="Peso objetivo">
                    <TextInput value={form.targetWeight} onChange={(v) => setField("targetWeight", v)} inputMode="decimal" suffix="kg" />
                  </Field>
                  <Field label="Altura">
                    <TextInput value={form.height} onChange={(v) => setField("height", v)} inputMode="numeric" suffix="cm" />
                  </Field>
                  <Field label="Edad">
                    <TextInput value={form.age} onChange={(v) => setField("age", v)} inputMode="numeric" suffix="años" />
                  </Field>
                </div>
              </div>

              <div className="rounded-md bg-surface-2 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-ink-3">Sexo biológico para fórmula</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Choice active={sex === "female"} onClick={() => setSex("female")} label="Mujer" />
                  <Choice active={sex === "male"} onClick={() => setSex("male")} label="Hombre" />
                </div>

                <div className="mt-6 text-xs font-bold uppercase tracking-wider text-ink-3">Actividad</div>
                <div className="mt-3 grid gap-2">
                  {ACTIVITY.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivity(item.id)}
                      className={clsx(
                        "rounded-sm border p-3 text-left transition-colors",
                        activity === item.id ? "border-primary bg-primary-soft" : "border-border bg-surface",
                      )}
                    >
                      <div className="text-sm font-extrabold">{item.label}</div>
                      <div className="mt-0.5 text-xs text-ink-2">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6 p-5 md:grid-cols-[0.85fr_1fr] md:p-8">
              <MeasurementGuide />
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-accent-soft text-accent">
                  <Ruler size={22} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Medidas iniciales</h2>
                <p className="mt-2 text-sm text-ink-2">
                  Usá cinta métrica, sin apretar. Esta foto guía queda como referencia visual de dónde medir.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {MEASURE_FIELDS.map((field) => (
                    <Field key={field.key} label={field.label}>
                      <TextInput value={form[field.key]} onChange={(v) => setField(field.key, v)} inputMode="decimal" suffix="cm" />
                    </Field>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 p-5 md:grid-cols-[1fr_0.9fr] md:p-8">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-primary-soft text-primary">
                  <Activity size={22} />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Tus calorías base</h2>
                <p className="mt-2 text-sm text-ink-2">
                  Arrancamos con déficit moderado del 15%. Lo importante es medir progreso y ajustar.
                </p>
                {calculated && (
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <ResultCard label="Mantenimiento" value={calculated.maintenanceKcal ?? 0} unit="kcal" />
                    <ResultCard label="Déficit" value={calculated.deficitKcal ?? 0} unit="kcal" highlighted />
                    <ResultCard label="Proteína" value={calculated.protein} unit="g" />
                    <ResultCard label="Agua" value={calculated.water} unit="ml" />
                  </div>
                )}
              </div>
              <div className="rounded-md bg-surface-2 p-5">
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-primary" />
                  <div className="font-extrabold">Objetivo</div>
                </div>
                <div className="mt-5 text-sm text-ink-2">Peso actual</div>
                <div className="tnum text-3xl font-extrabold">{num(form.weight).toFixed(1)} kg</div>
                <div className="mt-5 text-sm text-ink-2">Peso objetivo</div>
                <div className="tnum text-3xl font-extrabold">{num(form.targetWeight).toFixed(1)} kg</div>
                <div className="mt-5 rounded-sm bg-surface p-3 text-xs leading-relaxed text-ink-2">
                  Esto no es una prescripción médica; es una base editable para empezar a registrar y ajustar con datos reales.
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border p-5 md:flex md:items-center md:justify-between md:p-6">
            <div className="min-h-5 text-sm text-danger">{error}</div>
            <div className="mt-3 flex gap-2 md:mt-0">
              {step > 0 && (
                <Button variant="secondary" onClick={() => setStep((current) => current - 1)} disabled={saving}>
                  Atrás
                </Button>
              )}
              {step < 2 ? (
                <Button variant="primary" onClick={next} className="gap-2">
                  Continuar <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="primary" onClick={finish} disabled={saving || !calculated}>
                  {saving ? "Guardando..." : "Entrar a NutriTrack"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-11 rounded-sm border text-sm font-extrabold",
        active ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink",
      )}
    >
      {label}
    </button>
  );
}

function ResultCard({ label, value, unit, highlighted = false }: { label: string; value: number; unit: string; highlighted?: boolean }) {
  return (
    <div className={clsx("rounded-sm border p-4", highlighted ? "border-primary bg-primary-soft" : "border-border bg-surface")}>
      <div className="text-xs font-bold uppercase tracking-wider text-ink-3">{label}</div>
      <div className="tnum mt-2 text-3xl font-extrabold tracking-tight">
        {Math.round(value).toLocaleString("es-AR")} <span className="text-sm text-ink-2">{unit}</span>
      </div>
    </div>
  );
}

function MeasurementGuide() {
  return (
    <div className="rounded-md bg-surface-2 p-5">
      <div className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-3">Guía de medidas</div>
      <div className="relative mx-auto h-[420px] max-w-[260px]">
        <div className="absolute left-1/2 top-2 h-14 w-14 -translate-x-1/2 rounded-full border-2 border-ink-4 bg-surface" />
        <div className="absolute left-1/2 top-20 h-40 w-28 -translate-x-1/2 rounded-[48%] border-2 border-ink-4 bg-surface" />
        <div className="absolute left-[76px] top-24 h-32 w-5 -rotate-12 rounded-full border-2 border-ink-4 bg-surface" />
        <div className="absolute right-[76px] top-24 h-32 w-5 rotate-12 rounded-full border-2 border-ink-4 bg-surface" />
        <div className="absolute left-[103px] top-[244px] h-36 w-8 rounded-full border-2 border-ink-4 bg-surface" />
        <div className="absolute right-[103px] top-[244px] h-36 w-8 rounded-full border-2 border-ink-4 bg-surface" />

        <GuideLine top={152} label="Debajo busto" />
        <GuideLine top={190} label="Cintura" />
        <GuideLine top={240} label="Cadera" />
        <GuideLine top={305} label="Pierna" />
        <div className="absolute left-2 top-[150px] h-px w-16 bg-accent" />
        <div className="absolute left-1 top-[140px] text-[11px] font-bold text-accent">Brazo</div>
      </div>
    </div>
  );
}

function GuideLine({ top, label }: { top: number; label: string }) {
  return (
    <>
      <div className="absolute left-1/2 h-px w-44 -translate-x-1/2 bg-accent" style={{ top }} />
      <div className="absolute right-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent" style={{ top: top - 12 }}>
        {label}
      </div>
    </>
  );
}
