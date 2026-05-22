// ─── Domain types ────────────────────────────────────────────────────

export type Unit = "g" | "ml" | "unidad";

export type MealType = "desayuno" | "almuerzo" | "merienda" | "cena" | "snack";

export type DayKind = "deficit" | "mantenimiento" | "entreno" | "partido";

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  /** kcal per 100 g/ml */
  kcal: number;
  /** g per 100 g/ml */
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  unit: Unit;
}

export interface RecipeIngredient {
  foodId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  /** weight of the finished, cooked dish (g) — used to compute macros per 100 g of recipe */
  finalWeight: number;
  notes: string;
}

export interface MealEntry {
  id: string;
  mealType: MealType;
  /** one of foodId/recipeId must be set */
  foodId: string | null;
  recipeId: string | null;
  grams: number;
  time: string; // "HH:mm"
  date: string; // ISO date
}

export interface Measurement {
  date: string; // ISO date
  weight: number;
  waist: number;
  hips: number;
  thigh: number;
  arm: number;
  underbust: number;
}

export interface Goals {
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  fiber: number;
}

export interface DailyNotes {
  hunger: number; // 1-5
  energy: number; // 1-5
  digestion: string;
}

export interface DaySummary {
  date: string;
  dayLabel: string; // "Lun"
  dayNum: number;
  kcal: number;
  protein: number;
  kind: DayKind;
  weight: number | null;
  workout: "rest" | "fuerza" | "futbol" | "cardio";
  isToday?: boolean;
}

export interface User {
  name: string;
  email: string;
}

// ─── Static config ──────────────────────────────────────────────────

export const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: "desayuno", label: "Desayuno" },
  { id: "almuerzo", label: "Almuerzo" },
  { id: "merienda", label: "Merienda" },
  { id: "cena", label: "Cena" },
  { id: "snack", label: "Snack" },
];

export const DAY_KINDS: { id: DayKind; label: string; kcal: number }[] = [
  { id: "deficit", label: "Déficit", kcal: 2100 },
  { id: "mantenimiento", label: "Mantenimiento", kcal: 2400 },
  { id: "entreno", label: "Entreno", kcal: 2700 },
  { id: "partido", label: "Partido", kcal: 2900 },
];

export const DEFAULT_GOALS: Goals = {
  kcal: 2400,
  protein: 180,
  carbs: 260,
  fats: 75,
  water: 3000,
  fiber: 30,
};
