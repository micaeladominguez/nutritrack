"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import * as db from "./db";
import type {
  DailyNotes, Food, Goals, MealEntry, Measurement,
  Recipe, MealType, User, DaySummary,
} from "./types";
import { DEFAULT_GOALS } from "./types";

interface AppState {
  foods: Food[];
  recipes: Recipe[];
  entries: MealEntry[];
  measurements: Measurement[];
  weekData: DaySummary[];
  goals: Goals;
  water: number;
  notes: DailyNotes;
  user: User | null;
  loading: boolean;
  addFood: (food: Omit<Food, "id">) => Promise<void>;
  updateFood: (id: string, patch: Partial<Food>) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, "id">) => Promise<void>;
  updateRecipe: (id: string, patch: Partial<Recipe>) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  addEntry: (
    entry: Omit<MealEntry, "id" | "time" | "date">,
    macros: { kcal: number; protein: number; carbs: number; fats: number; fiber: number },
  ) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  addMeasurement: (measurement: Measurement) => Promise<void>;
  setGoals: (goals: Goals) => Promise<void>;
  setWater: (water: number) => Promise<void>;
  setNotes: (notes: DailyNotes) => Promise<void>;
  signOut: () => Promise<void>;
  modal: ModalState;
  openAddMeal: (mealType: MealType) => void;
  closeModal: () => void;
}

export type ModalState =
  | { kind: "none" }
  | { kind: "add-meal"; mealType: MealType };

const Ctx = createContext<AppState | null>(null);

function dateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayOfWeek(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
  return dateString(monday);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [weekData, setWeekData] = useState<DaySummary[]>([]);
  const [goals, setGoalsState] = useState<Goals>(DEFAULT_GOALS);
  const [water, setWaterState] = useState(0);
  const [notes, setNotesState] = useState<DailyNotes>({ hunger: 3, energy: 3, digestion: "" });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!db.hasSession()) {
        if (window.location.pathname !== "/login") window.location.replace("/login");
        if (mounted) setLoading(false);
        return;
      }

      try {
        const [profile, foodsData, recipesData, log, measurementsData, goalsData, week] =
          await Promise.all([
            db.getProfile(),
            db.getFoods(),
            db.getRecipes(),
            db.getDailyLog(dateString()),
            db.getMeasurements(),
            db.getGoals(),
            db.getWeekData(getMondayOfWeek()),
          ]);

        if (!mounted) return;
        setUser(profile);
        setFoods(foodsData);
        setRecipes(recipesData);
        setEntries(log.meals.map((meal) => {
          const loggedAt = new Date(meal.loggedAt);
          return {
            id: meal.id,
            mealType: meal.mealType,
            foodId: meal.foodItemId,
            recipeId: meal.recipeId,
            grams: meal.grams,
            time: loggedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
            date: dateString(loggedAt),
          };
        }));
        setMeasurements(measurementsData);
        setGoalsState(goalsData);
        setWeekData(week);
        setWaterState(log.waterMl ?? 0);
        setNotesState({
          hunger: log.hunger ?? 3,
          energy: log.energy ?? 3,
          digestion: log.digestion ?? "",
        });
      } catch (error) {
        if (error instanceof db.ApiError && (error.status === 401 || error.status === 403)) {
          await db.signOut();
          if (window.location.pathname !== "/login") window.location.replace("/login");
        } else {
          console.error("No se pudo cargar NutriTrack", error);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void bootstrap();
    return () => { mounted = false; };
  }, []);

  const addFood = useCallback(async (food: Omit<Food, "id">) => {
    const saved = await db.createFood(food);
    setFoods((items) => [...items, saved].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const updateFood = useCallback(async (id: string, patch: Partial<Food>) => {
    const current = foods.find((food) => food.id === id);
    if (!current) return;
    const saved = await db.updateFood(id, { ...current, ...patch });
    setFoods((items) => items.map((food) => (food.id === id ? saved : food)));
  }, [foods]);

  const removeFood = useCallback(async (id: string) => {
    await db.deleteFood(id);
    setFoods((items) => items.filter((food) => food.id !== id));
  }, []);

  const addRecipe = useCallback(async (recipe: Omit<Recipe, "id">) => {
    const saved = await db.createRecipe(recipe);
    setRecipes((items) => [...items, saved].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const updateRecipe = useCallback(async (id: string, patch: Partial<Recipe>) => {
    const current = recipes.find((recipe) => recipe.id === id);
    if (!current) return;
    const saved = await db.updateRecipe(id, { ...current, ...patch });
    setRecipes((items) => items.map((recipe) => (recipe.id === id ? saved : recipe)));
  }, [recipes]);

  const removeRecipe = useCallback(async (id: string) => {
    await db.deleteRecipe(id);
    setRecipes((items) => items.filter((recipe) => recipe.id !== id));
  }, []);

  const addEntry = useCallback(async (
    entry: Omit<MealEntry, "id" | "time" | "date">,
    _macros: { kcal: number; protein: number; carbs: number; fats: number; fiber: number },
  ) => {
    const saved = await db.addMealEntry({
      mealType: entry.mealType,
      foodId: entry.foodId ?? undefined,
      recipeId: entry.recipeId ?? undefined,
      grams: entry.grams,
    });
    setEntries((items) => [...items, saved]);
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    await db.deleteMealEntry(id);
    setEntries((items) => items.filter((entry) => entry.id !== id));
  }, []);

  const addMeasurement = useCallback(async (measurement: Measurement) => {
    const saved = await db.upsertMeasurement(measurement);
    setMeasurements((items) => [saved, ...items.filter((item) => item.date !== saved.date)]);
  }, []);

  const setGoals = useCallback(async (nextGoals: Goals) => {
    const saved = await db.updateGoals(nextGoals);
    setGoalsState(saved);
  }, []);

  const setWater = useCallback(async (nextWater: number) => {
    await db.updateDailyLog(dateString(), { waterMl: nextWater });
    setWaterState(nextWater);
  }, []);

  const setNotes = useCallback(async (nextNotes: DailyNotes) => {
    await db.updateDailyLog(dateString(), nextNotes);
    setNotesState(nextNotes);
  }, []);

  const signOut = useCallback(async () => {
    await db.signOut();
    setUser(null);
  }, []);

  const openAddMeal = useCallback((mealType: MealType) => {
    setModal({ kind: "add-meal", mealType });
  }, []);
  const closeModal = useCallback(() => setModal({ kind: "none" }), []);

  const value = useMemo<AppState>(() => ({
    foods, recipes, entries, measurements, weekData,
    goals, water, notes, user, loading,
    addFood, updateFood, removeFood,
    addRecipe, updateRecipe, removeRecipe,
    addEntry, removeEntry, addMeasurement,
    setGoals, setWater, setNotes, signOut,
    modal, openAddMeal, closeModal,
  }), [
    foods, recipes, entries, measurements, weekData,
    goals, water, notes, user, loading,
    addFood, updateFood, removeFood,
    addRecipe, updateRecipe, removeRecipe,
    addEntry, removeEntry, addMeasurement,
    setGoals, setWater, setNotes, signOut,
    modal, openAddMeal, closeModal,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error("useApp must be used inside <AppProvider>");
  return value;
}
