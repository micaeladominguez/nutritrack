import type { Food, Recipe, MealEntry, Measurement, DaySummary } from "./types";

/**
 * Sample data — replace with Supabase queries in production.
 * Kept here so the UI works out of the box without a backend.
 */

export const SAMPLE_FOODS: Food[] = [
  { id: "f1", name: "Pollo a la plancha", brand: null, kcal: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, unit: "g" },
  { id: "f2", name: "Arroz blanco cocido", brand: null, kcal: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, unit: "g" },
  { id: "f3", name: "Palta", brand: null, kcal: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, unit: "g" },
  { id: "f4", name: "Huevo entero", brand: null, kcal: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, unit: "g" },
  { id: "f5", name: "Avena tradicional", brand: "Quaker", kcal: 379, protein: 13, carbs: 68, fats: 6.5, fiber: 10, unit: "g" },
  { id: "f6", name: "Yogur griego natural", brand: "Ilolay", kcal: 95, protein: 9, carbs: 4, fats: 5, fiber: 0, unit: "g" },
  { id: "f7", name: "Banana", brand: null, kcal: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, unit: "unidad" },
  { id: "f8", name: "Manteca de maní", brand: "Mantecol", kcal: 588, protein: 25, carbs: 20, fats: 50, fiber: 6, unit: "g" },
  { id: "f9", name: "Lomo de cerdo", brand: null, kcal: 143, protein: 26, carbs: 0, fats: 3.5, fiber: 0, unit: "g" },
  { id: "f10", name: "Batata", brand: null, kcal: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3, unit: "g" },
  { id: "f11", name: "Brócoli", brand: null, kcal: 35, protein: 2.4, carbs: 7, fats: 0.4, fiber: 3.3, unit: "g" },
  { id: "f12", name: "Almendras", brand: null, kcal: 579, protein: 21, carbs: 22, fats: 50, fiber: 12, unit: "g" },
  { id: "f13", name: "Pan integral", brand: "Bimbo", kcal: 247, protein: 13, carbs: 41, fats: 3.4, fiber: 7, unit: "g" },
  { id: "f14", name: "Queso port salut", brand: "La Paulina", kcal: 305, protein: 22, carbs: 1, fats: 24, fiber: 0, unit: "g" },
  { id: "f15", name: "Tomate", brand: null, kcal: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, unit: "g" },
  { id: "f16", name: "Aceite de oliva", brand: null, kcal: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, unit: "ml" },
];

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "Bowl de pollo y arroz",
    ingredients: [
      { foodId: "f1", grams: 200 },
      { foodId: "f2", grams: 180 },
      { foodId: "f3", grams: 60 },
      { foodId: "f11", grams: 100 },
      { foodId: "f16", grams: 10 },
    ],
    finalWeight: 550,
    unit: "g",
    notes: "Almuerzo go-to. Pollo grillado, arroz, palta y brócoli salteado.",
  },
  {
    id: "r2",
    name: "Avena con yogur y banana",
    ingredients: [
      { foodId: "f5", grams: 60 },
      { foodId: "f6", grams: 150 },
      { foodId: "f7", grams: 120 },
      { foodId: "f8", grams: 15 },
    ],
    finalWeight: 345,
    unit: "g",
    notes: "Desayuno post-entreno.",
  },
  {
    id: "r3",
    name: "Tostada con huevo y palta",
    ingredients: [
      { foodId: "f13", grams: 60 },
      { foodId: "f4", grams: 100 },
      { foodId: "f3", grams: 50 },
      { foodId: "f15", grams: 40 },
    ],
    finalWeight: 250,
    unit: "g",
    notes: "",
  },
];

const TODAY = new Date().toISOString().slice(0, 10);

export const SAMPLE_TODAY_ENTRIES: MealEntry[] = [
  { id: "m1", mealType: "desayuno", recipeId: "r2", foodId: null, grams: 345, time: "08:15", date: TODAY },
  { id: "m2", mealType: "almuerzo", recipeId: "r1", foodId: null, grams: 550, time: "13:20", date: TODAY },
  { id: "m3", mealType: "merienda", recipeId: null, foodId: "f6", grams: 200, time: "17:00", date: TODAY },
  { id: "m4", mealType: "merienda", recipeId: null, foodId: "f12", grams: 25, time: "17:02", date: TODAY },
];

export const SAMPLE_MEASUREMENTS: Measurement[] = [
  { date: "2026-03-30", weight: 78.4, waist: 84, hips: 99, thigh: 58, arm: 33, underbust: 88 },
  { date: "2026-04-06", weight: 77.8, waist: 83.5, hips: 99, thigh: 58, arm: 33.2, underbust: 87.5 },
  { date: "2026-04-13", weight: 77.5, waist: 83, hips: 98.5, thigh: 58.2, arm: 33.5, underbust: 87 },
  { date: "2026-04-20", weight: 77.1, waist: 82.5, hips: 98, thigh: 58.5, arm: 33.5, underbust: 87 },
  { date: "2026-04-27", weight: 76.6, waist: 82, hips: 97.5, thigh: 58.5, arm: 33.8, underbust: 86.5 },
  { date: "2026-05-04", weight: 76.4, waist: 81.5, hips: 97, thigh: 58.8, arm: 34, underbust: 86 },
  { date: "2026-05-11", weight: 76.0, waist: 81, hips: 96.5, thigh: 59, arm: 34, underbust: 86 },
  { date: "2026-05-18", weight: 75.7, waist: 80.5, hips: 96, thigh: 59, arm: 34.2, underbust: 85.5 },
];

export const SAMPLE_WEEK: DaySummary[] = [
  { date: "2026-05-16", dayLabel: "Sáb", dayNum: 16, kcal: 2480, protein: 175, weight: null, workout: "rest" },
  { date: "2026-05-17", dayLabel: "Dom", dayNum: 17, kcal: 2310, protein: 168, weight: null, workout: "rest" },
  { date: "2026-05-18", dayLabel: "Lun", dayNum: 18, kcal: 2620, protein: 192, weight: 75.7, workout: "fuerza" },
  { date: "2026-05-19", dayLabel: "Mar", dayNum: 19, kcal: 2280, protein: 178, weight: null, workout: "rest" },
  { date: "2026-05-20", dayLabel: "Mié", dayNum: 20, kcal: 2640, protein: 195, weight: null, workout: "fuerza" },
  { date: "2026-05-21", dayLabel: "Jue", dayNum: 21, kcal: 2710, protein: 182, weight: null, workout: "futbol" },
  { date: "2026-05-22", dayLabel: "Vie", dayNum: 22, kcal: 1670, protein: 124, weight: null, workout: "rest", isToday: true },
];
