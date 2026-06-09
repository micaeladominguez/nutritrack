import type { DayKind, DaySummary, Food, Goals, MealEntry, Measurement, Recipe, User } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const TOKEN_KEY = "nutritrack_token";

interface AuthResponse { token: string; user: ApiUser }
interface ApiUser { id: string; name: string; email: string }
interface ApiRecipe {
  id: string;
  name: string;
  finalWeight: number;
  notes: string;
  ingredients: { foodItemId: string; grams: number }[];
}
interface ApiMeal {
  id: string;
  mealType: MealEntry["mealType"];
  foodItemId: string | null;
  recipeId: string | null;
  grams: number;
  loggedAt: string;
}
export interface DailyLog {
  dayKind: DayKind;
  waterMl: number;
  hunger: number | null;
  energy: number | null;
  digestion: string;
  meals: ApiMeal[];
}
interface ApiMeasurement {
  id: string;
  date: string;
  weight: number | null;
  waist: number | null;
  hips: number | null;
  thigh: number | null;
  arm: number | null;
  underbust: number | null;
}
interface ApiWeekDay {
  date: string;
  dayLabel: string;
  kcal: number;
  protein: number;
  dayKind: DayKind;
  weight: number | null;
  isToday: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new ApiError(body?.error ?? `Error del servidor (${response.status}).`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rowToRecipe(recipe: ApiRecipe): Recipe {
  return {
    id: recipe.id,
    name: recipe.name,
    finalWeight: recipe.finalWeight,
    notes: recipe.notes,
    ingredients: recipe.ingredients.map((i) => ({ foodId: i.foodItemId, grams: i.grams })),
  };
}

function rowToMealEntry(meal: ApiMeal): MealEntry {
  const loggedAt = new Date(meal.loggedAt);
  return {
    id: meal.id,
    mealType: meal.mealType,
    foodId: meal.foodItemId,
    recipeId: meal.recipeId,
    grams: meal.grams,
    time: loggedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    date: localDate(loggedAt),
  };
}

function rowToMeasurement(row: ApiMeasurement): Measurement {
  return {
    date: row.date,
    weight: row.weight ?? 0,
    waist: row.waist ?? 0,
    hips: row.hips ?? 0,
    thigh: row.thigh ?? 0,
    arm: row.arm ?? 0,
    underbust: row.underbust ?? 0,
  };
}

export function hasSession() {
  return Boolean(getToken());
}

export async function signIn(email: string, password: string): Promise<User> {
  const auth = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem(TOKEN_KEY, auth.token);
  return auth.user;
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const auth = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  window.localStorage.setItem(TOKEN_KEY, auth.token);
  return auth.user;
}

export async function signOut() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function resetPassword() {
  throw new Error("La recuperación de contraseña todavía no está disponible.");
}

export async function getProfile(): Promise<User> {
  return request<ApiUser>("/api/auth/me");
}

export async function getFoods(): Promise<Food[]> {
  return request<Food[]>("/api/foods");
}

export async function createFood(food: Omit<Food, "id">): Promise<Food> {
  return request<Food>("/api/foods", { method: "POST", body: JSON.stringify(food) });
}

export async function updateFood(id: string, food: Omit<Food, "id">): Promise<Food> {
  return request<Food>(`/api/foods/${id}`, { method: "PUT", body: JSON.stringify(food) });
}

export async function deleteFood(id: string) {
  await request<void>(`/api/foods/${id}`, { method: "DELETE" });
}

export async function getRecipes(): Promise<Recipe[]> {
  return (await request<ApiRecipe[]>("/api/recipes")).map(rowToRecipe);
}

function recipePayload(recipe: Omit<Recipe, "id">) {
  return {
    name: recipe.name,
    finalWeight: recipe.finalWeight,
    notes: recipe.notes,
    ingredients: recipe.ingredients.map((i) => ({ foodItemId: i.foodId, grams: i.grams })),
  };
}

export async function createRecipe(recipe: Omit<Recipe, "id">): Promise<Recipe> {
  const saved = await request<ApiRecipe>("/api/recipes", {
    method: "POST",
    body: JSON.stringify(recipePayload(recipe)),
  });
  return rowToRecipe(saved);
}

export async function updateRecipe(id: string, recipe: Omit<Recipe, "id">): Promise<Recipe> {
  const saved = await request<ApiRecipe>(`/api/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(recipePayload(recipe)),
  });
  return rowToRecipe(saved);
}

export async function deleteRecipe(id: string) {
  await request<void>(`/api/recipes/${id}`, { method: "DELETE" });
}

export async function getDailyLog(date = localDate()): Promise<DailyLog> {
  return request<DailyLog>(`/api/log/${date}`);
}

export async function updateDailyLog(
  date: string,
  patch: Partial<{ dayKind: DayKind; waterMl: number; hunger: number; energy: number; digestion: string }>,
) {
  return request<DailyLog>(`/api/log/${date}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function addMealEntry(
  entry: { mealType: MealEntry["mealType"]; foodId?: string; recipeId?: string; grams: number },
  date = localDate(),
): Promise<MealEntry> {
  const saved = await request<ApiMeal>("/api/log/meals", {
    method: "POST",
    body: JSON.stringify({
      mealType: entry.mealType,
      foodItemId: entry.foodId ?? null,
      recipeId: entry.recipeId ?? null,
      grams: entry.grams,
      date,
    }),
  });
  return rowToMealEntry(saved);
}

export async function deleteMealEntry(id: string) {
  await request<void>(`/api/log/meals/${id}`, { method: "DELETE" });
}

export async function getMeasurements(): Promise<Measurement[]> {
  return (await request<ApiMeasurement[]>("/api/measurements")).map(rowToMeasurement);
}

export async function upsertMeasurement(measurement: Measurement): Promise<Measurement> {
  const saved = await request<ApiMeasurement>("/api/measurements", {
    method: "POST",
    body: JSON.stringify(measurement),
  });
  return rowToMeasurement(saved);
}

export async function getGoals(): Promise<Goals> {
  return request<Goals>("/api/goals");
}

export async function updateGoals(goals: Goals): Promise<Goals> {
  return request<Goals>("/api/goals", { method: "PUT", body: JSON.stringify(goals) });
}

export async function getWeekData(mondayDate: string): Promise<DaySummary[]> {
  const days = await request<ApiWeekDay[]>(`/api/week?monday=${mondayDate}`);
  return days.map((day) => ({
    date: day.date,
    dayLabel: day.dayLabel,
    dayNum: Number(day.date.slice(8, 10)),
    kcal: Math.round(day.kcal),
    protein: Math.round(day.protein),
    kind: day.dayKind,
    weight: day.weight,
    workout: "rest",
    isToday: day.isToday,
  }));
}
