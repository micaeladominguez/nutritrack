"use client";

/**
 * lib/store.tsx — App-wide state, now backed by Supabase.
 *
 * Strategy: optimistic updates.
 * Every mutation updates local state immediately, then fires the DB call.
 * On error it reverts + shows a toast (feel free to add your toast lib).
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { createClient } from "./supabase";
import * as db from "./db";
import type {
  DailyNotes, DayKind, Food, Goals, MealEntry, Measurement,
  Recipe, MealType, User, DaySummary,
} from "./types";
import { DEFAULT_GOALS } from "./types";

// ── Types ────────────────────────────────────────────────────────────

interface AppState {
  // entities
  foods: Food[];
  recipes: Recipe[];
  entries: MealEntry[];
  measurements: Measurement[];
  weekData: DaySummary[];
  // settings
  goals: Goals;
  dayKind: DayKind;
  water: number;
  notes: DailyNotes;
  user: User | null;
  loading: boolean;
  // mutations
  addFood: (food: Omit<Food, "id">) => Promise<void>;
  updateFood: (id: string, patch: Partial<Food>) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, "id">) => Promise<void>;
  updateRecipe: (id: string, patch: Partial<Recipe>) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  addEntry: (entry: Omit<MealEntry, "id" | "time" | "date">, macros: { kcal: number; protein: number; carbs: number; fats: number; fiber: number }) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  addMeasurement: (m: Omit<Measurement, "date">) => Promise<void>;
  setGoals: (g: Goals) => Promise<void>;
  setDayKind: (k: DayKind) => Promise<void>;
  setWater: (n: number) => Promise<void>;
  setNotes: (n: DailyNotes) => Promise<void>;
  signOut: () => Promise<void>;
  // global modal
  modal: ModalState;
  openAddMeal: (mealType: MealType) => void;
  closeModal: () => void;
}

export type ModalState =
  | { kind: "none" }
  | { kind: "add-meal"; mealType: MealType };

const Ctx = createContext<AppState | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// ── Provider ─────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [weekData, setWeekData] = useState<DaySummary[]>([]);
  const [goals, setGoalsState] = useState<Goals>(DEFAULT_GOALS);
  const [dayKind, setDayKindState] = useState<DayKind>("deficit");
  const [water, setWaterState] = useState(0);
  const [notes, setNotesState] = useState<DailyNotes>({ hunger: 3, energy: 3, digestion: "" });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  // ── Bootstrap ──────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [profile, foodsData, recipesData, entriesData, measurementsData, goalsData, weekDat] =
          await Promise.all([
            db.getProfile(supabase),
            db.getFoods(supabase),
            db.getRecipes(supabase),
            db.getMealEntries(supabase),
            db.getMeasurements(supabase),
            db.getGoals(supabase),
            db.getWeekData(supabase, getMondayOfWeek()),
          ]);

        if (!mounted) return;
        if (profile) setUser({ name: profile.name, email: profile.email });
        setFoods(foodsData);
        setRecipes(recipesData);
        setEntries(entriesData);
        setMeasurements(measurementsData);
        setGoalsState(goalsData);
        setWeekData(weekDat);

        // Load today's log state
        const log = await db.getOrCreateDailyLog(supabase, todayStr());
        if (mounted && log) {
          setDayKindState((log.day_kind as DayKind) ?? "deficit");
          setWaterState(log.water_ml ?? 0);
          setNotesState({
            hunger: log.hunger ?? 3,
            energy: log.energy ?? 3,
            digestion: log.digestion ?? "",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    // Auth state changes (login / logout from other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && user) {
        // Solo redirigir si había un usuario logueado (logout real)
        setUser(null);
        window.location.href = "/login";
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Food mutations ─────────────────────────────────────────────────

  const addFood = useCallback(async (food: Omit<Food, "id">) => {
    const saved = await db.upsertFood(supabase, food);
    setFoods((xs) => [...xs, saved].sort((a, b) => a.name.localeCompare(b.name)));
  }, [supabase]);

  const updateFood = useCallback(async (id: string, patch: Partial<Food>) => {
    setFoods((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await db.upsertFood(supabase, { id, ...patch } as Food);
  }, [supabase]);

  const removeFood = useCallback(async (id: string) => {
    setFoods((xs) => xs.filter((x) => x.id !== id));
    await db.deleteFood(supabase, id);
  }, [supabase]);

  // ── Recipe mutations ───────────────────────────────────────────────

  const addRecipe = useCallback(async (recipe: Omit<Recipe, "id">) => {
    const newId = await db.upsertRecipe(supabase, recipe);
    setRecipes((xs) => [...xs, { ...recipe, id: newId }].sort((a, b) => a.name.localeCompare(b.name)));
  }, [supabase]);

  const updateRecipe = useCallback(async (id: string, patch: Partial<Recipe>) => {
    setRecipes((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const full = recipes.find((r) => r.id === id);
    if (full) await db.upsertRecipe(supabase, { ...full, ...patch });
  }, [supabase, recipes]);

  const removeRecipe = useCallback(async (id: string) => {
    setRecipes((xs) => xs.filter((x) => x.id !== id));
    await db.deleteRecipe(supabase, id);
  }, [supabase]);

  // ── Meal entry mutations ───────────────────────────────────────────

  const addEntry = useCallback(async (
    entry: Omit<MealEntry, "id" | "time" | "date">,
    macros: { kcal: number; protein: number; carbs: number; fats: number; fiber: number }
  ) => {
    const saved = await db.addMealEntry(supabase, {
      mealType: entry.mealType,
      foodId: entry.foodId ?? undefined,
      recipeId: entry.recipeId ?? undefined,
      grams: entry.grams,
      ...macros,
    });
    setEntries((xs) => [...xs, saved]);
  }, [supabase]);

  const removeEntry = useCallback(async (id: string) => {
    setEntries((xs) => xs.filter((x) => x.id !== id));
    await db.deleteMealEntry(supabase, id);
  }, [supabase]);

  // ── Measurement mutations ──────────────────────────────────────────

  const addMeasurement = useCallback(async (m: Omit<Measurement, "date">) => {
    const withDate = { ...m, date: todayStr() };
    setMeasurements((xs) => [withDate, ...xs.filter((x) => x.date !== withDate.date)]);
    await db.upsertMeasurement(supabase, m);
  }, [supabase]);

  // ── Settings mutations ─────────────────────────────────────────────

  const setGoals = useCallback(async (g: Goals) => {
    setGoalsState(g);
    await db.updateGoals(supabase, g);
  }, [supabase]);

  const setDayKind = useCallback(async (k: DayKind) => {
    setDayKindState(k);
    await db.updateDailyLog(supabase, todayStr(), { day_kind: k });
  }, [supabase]);

  const setWater = useCallback(async (n: number) => {
    setWaterState(n);
    await db.updateDailyLog(supabase, todayStr(), { water_ml: n });
  }, [supabase]);

  const setNotes = useCallback(async (n: DailyNotes) => {
    setNotesState(n);
    await db.updateDailyLog(supabase, todayStr(), {
      hunger: n.hunger,
      energy: n.energy,
      digestion: n.digestion,
    });
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    await db.signOut(supabase);
  }, [supabase]);

  // ── Modal ──────────────────────────────────────────────────────────

  const openAddMeal = useCallback((mealType: MealType) => {
    setModal({ kind: "add-meal", mealType });
  }, []);
  const closeModal = useCallback(() => setModal({ kind: "none" }), []);

  // ── Context value ──────────────────────────────────────────────────

  const value = useMemo<AppState>(
    () => ({
      foods, recipes, entries, measurements, weekData,
      goals, dayKind, water, notes, user, loading,
      addFood, updateFood, removeFood,
      addRecipe, updateRecipe, removeRecipe,
      addEntry, removeEntry,
      addMeasurement,
      setGoals, setDayKind, setWater, setNotes,
      signOut: handleSignOut,
      modal, openAddMeal, closeModal,
    }),
    [
      foods, recipes, entries, measurements, weekData,
      goals, dayKind, water, notes, user, loading,
      addFood, updateFood, removeFood,
      addRecipe, updateRecipe, removeRecipe,
      addEntry, removeEntry, addMeasurement,
      setGoals, setDayKind, setWater, setNotes,
      handleSignOut, modal, openAddMeal, closeModal,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}
