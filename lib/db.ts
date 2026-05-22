/**
 * lib/db.ts — All Supabase queries for NutriTrack.
 * Each function takes a `supabase` client (from createClient()) so it's
 * usable in both Client Components and Server Components/Route Handlers.
 *
 * Naming: get* = read, upsert* = insert or update, delete* = delete.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Food, Recipe, RecipeIngredient, MealEntry, Measurement, Goals, DayKind, DailyNotes } from "./types";

// ─── HELPERS ────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── AUTH ────────────────────────────────────────────────────────────

export async function getProfile(sb: SupabaseClient) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("name").eq("id", user.id).single();
  return { id: user.id, email: user.email ?? "", name: data?.name ?? "" };
}

export async function signIn(sb: SupabaseClient, email: string, password: string) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUp(sb: SupabaseClient, name: string, email: string, password: string) {
  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);
}

export async function signOut(sb: SupabaseClient) {
  await sb.auth.signOut();
}

export async function resetPassword(sb: SupabaseClient, email: string) {
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
}

// ─── FOODS ──────────────────────────────────────────────────────────

export async function getFoods(sb: SupabaseClient): Promise<Food[]> {
  const { data, error } = await sb
    .from("food_items")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToFood);
}

export async function upsertFood(sb: SupabaseClient, food: Omit<Food, "id"> & { id?: string }) {
  const { data: { user } } = await sb.auth.getUser();
  const row = {
    ...(food.id ? { id: food.id } : {}),
    user_id: user!.id,
    name: food.name,
    brand: food.brand,
    kcal: food.kcal,
    protein: food.protein,
    carbs: food.carbs,
    fats: food.fats,
    fiber: food.fiber,
    unit: food.unit,
  };
  const { data, error } = await sb.from("food_items").upsert(row).select().single();
  if (error) throw error;
  return rowToFood(data);
}

export async function deleteFood(sb: SupabaseClient, id: string) {
  const { error } = await sb.from("food_items").delete().eq("id", id);
  if (error) throw error;
}

function rowToFood(r: Record<string, unknown>): Food {
  return {
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    kcal: Number(r.kcal),
    protein: Number(r.protein),
    carbs: Number(r.carbs),
    fats: Number(r.fats),
    fiber: Number(r.fiber),
    unit: r.unit as Food["unit"],
  };
}

// ─── RECIPES ────────────────────────────────────────────────────────

export async function getRecipes(sb: SupabaseClient): Promise<Recipe[]> {
  const { data, error } = await sb
    .from("recipes")
    .select("*, recipe_ingredients(*)")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToRecipe);
}

export async function upsertRecipe(
  sb: SupabaseClient,
  recipe: Omit<Recipe, "id"> & { id?: string }
) {
  const { data: { user } } = await sb.auth.getUser();

  // Upsert recipe header
  const { data: recipeRow, error: recipeErr } = await sb
    .from("recipes")
    .upsert({
      ...(recipe.id ? { id: recipe.id } : {}),
      user_id: user!.id,
      name: recipe.name,
      final_weight: recipe.finalWeight,
      notes: recipe.notes,
    })
    .select()
    .single();
  if (recipeErr) throw recipeErr;

  // Replace ingredients: delete old, insert new
  await sb.from("recipe_ingredients").delete().eq("recipe_id", recipeRow.id);
  if (recipe.ingredients.length > 0) {
    const ingRows = recipe.ingredients.map((ing) => ({
      recipe_id: recipeRow.id,
      food_item_id: ing.foodId,
      grams: ing.grams,
    }));
    const { error: ingErr } = await sb.from("recipe_ingredients").insert(ingRows);
    if (ingErr) throw ingErr;
  }

  return recipeRow.id as string;
}

export async function deleteRecipe(sb: SupabaseClient, id: string) {
  const { error } = await sb.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

function rowToRecipe(r: Record<string, unknown>): Recipe {
  const ings = (r.recipe_ingredients as Record<string, unknown>[] ?? []);
  return {
    id: r.id as string,
    name: r.name as string,
    finalWeight: Number(r.final_weight),
    notes: (r.notes ?? "") as string,
    ingredients: ings.map((i) => ({
      foodId: i.food_item_id as string,
      grams: Number(i.grams),
    })),
  };
}

// ─── DAILY LOG (get or create for a date) ───────────────────────────

export async function getOrCreateDailyLog(sb: SupabaseClient, date = today()) {
  const { data: { user } } = await sb.auth.getUser();
  // Try to get existing
  const { data: existing } = await sb
    .from("daily_logs")
    .select("*")
    .eq("user_id", user!.id)
    .eq("date", date)
    .maybeSingle();

  if (existing) return existing;

  // Create new
  const { data, error } = await sb
    .from("daily_logs")
    .insert({ user_id: user!.id, date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDailyLog(
  sb: SupabaseClient,
  date: string,
  patch: {
    day_kind?: DayKind;
    water_ml?: number;
    hunger?: number;
    energy?: number;
    digestion?: string;
  }
) {
  const log = await getOrCreateDailyLog(sb, date);
  const { error } = await sb
    .from("daily_logs")
    .update(patch)
    .eq("id", log.id);
  if (error) throw error;
}

// ─── MEAL ENTRIES ────────────────────────────────────────────────────

export async function getMealEntries(sb: SupabaseClient, date = today()): Promise<MealEntry[]> {
  const log = await getOrCreateDailyLog(sb, date);
  const { data, error } = await sb
    .from("meal_logs")
    .select("*")
    .eq("daily_log_id", log.id)
    .order("logged_at");
  if (error) throw error;
  return (data ?? []).map(rowToMealEntry);
}

export async function addMealEntry(
  sb: SupabaseClient,
  entry: {
    mealType: MealEntry["mealType"];
    foodId?: string;
    recipeId?: string;
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  },
  date = today()
): Promise<MealEntry> {
  const log = await getOrCreateDailyLog(sb, date);
  const { data, error } = await sb
    .from("meal_logs")
    .insert({
      daily_log_id: log.id,
      meal_type: entry.mealType,
      food_item_id: entry.foodId ?? null,
      recipe_id: entry.recipeId ?? null,
      grams: entry.grams,
      kcal: entry.kcal,
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fats,
      fiber: entry.fiber,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToMealEntry(data);
}

export async function deleteMealEntry(sb: SupabaseClient, id: string) {
  const { error } = await sb.from("meal_logs").delete().eq("id", id);
  if (error) throw error;
}

function rowToMealEntry(r: Record<string, unknown>): MealEntry {
  const t = new Date(r.logged_at as string);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  return {
    id: r.id as string,
    mealType: r.meal_type as MealEntry["mealType"],
    foodId: (r.food_item_id ?? null) as string | null,
    recipeId: (r.recipe_id ?? null) as string | null,
    grams: Number(r.grams),
    time: `${hh}:${mm}`,
    date: (r.logged_at as string).slice(0, 10),
  };
}

// ─── MEASUREMENTS ────────────────────────────────────────────────────

export async function getMeasurements(sb: SupabaseClient): Promise<Measurement[]> {
  const { data, error } = await sb
    .from("measurements")
    .select("*")
    .order("date", { ascending: false })
    .limit(52); // ~1 year of weekly entries
  if (error) throw error;
  return (data ?? []).map(rowToMeasurement);
}

export async function upsertMeasurement(sb: SupabaseClient, m: Omit<Measurement, "date"> & { date?: string }) {
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("measurements").upsert({
    user_id: user!.id,
    date: m.date ?? today(),
    weight: m.weight,
    waist: m.waist,
    hips: m.hips,
    thigh: m.thigh,
    arm: m.arm,
    underbust: m.underbust,
  });
  if (error) throw error;
}

function rowToMeasurement(r: Record<string, unknown>): Measurement {
  return {
    date: r.date as string,
    weight: Number(r.weight),
    waist: Number(r.waist),
    hips: Number(r.hips),
    thigh: Number(r.thigh),
    arm: Number(r.arm),
    underbust: Number(r.underbust),
  };
}

// ─── GOALS ───────────────────────────────────────────────────────────

export async function getGoals(sb: SupabaseClient): Promise<Goals> {
  const { data: { user } } = await sb.auth.getUser();
  const { data } = await sb
    .from("user_goals")
    .select("*")
    .eq("user_id", user!.id)
    .single();
  if (!data) return { kcal: 2400, protein: 180, carbs: 260, fats: 75, water: 3000, fiber: 30 };
  return {
    kcal: Number(data.kcal),
    protein: Number(data.protein),
    carbs: Number(data.carbs),
    fats: Number(data.fats),
    water: Number(data.water),
    fiber: Number(data.fiber),
  };
}

export async function updateGoals(sb: SupabaseClient, goals: Goals) {
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb
    .from("user_goals")
    .upsert({ user_id: user!.id, ...goals, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ─── WEEK DATA (for WeekView) ────────────────────────────────────────

export async function getWeekData(sb: SupabaseClient, mondayDate: string) {
  const { data: { user } } = await sb.auth.getUser();

  // Build 7 dates from monday
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Fetch daily_logs + meal totals for the week
  const { data: logs } = await sb
    .from("daily_logs")
    .select("*, meal_logs(kcal, protein)")
    .eq("user_id", user!.id)
    .gte("date", dates[0])
    .lte("date", dates[6]);

  // Fetch weight entries for the week
  const { data: weights } = await sb
    .from("measurements")
    .select("date, weight")
    .eq("user_id", user!.id)
    .gte("date", dates[0])
    .lte("date", dates[6]);

  const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const todayStr = today();

  return dates.map((date, i) => {
    const log = (logs ?? []).find((l) => l.date === date);
    const meals = (log?.meal_logs ?? []) as { kcal: number; protein: number }[];
    const kcal = meals.reduce((a: number, m: { kcal: number }) => a + m.kcal, 0);
    const protein = meals.reduce((a: number, m: { protein: number }) => a + m.protein, 0);
    const wRow = (weights ?? []).find((w) => w.date === date);

    return {
      date,
      dayLabel: DAY_LABELS[i],
      dayNum: new Date(date).getDate(),
      kcal: Math.round(kcal),
      protein: Math.round(protein),
      kind: (log?.day_kind ?? "deficit") as DayKind,
      weight: wRow?.weight ?? null,
      workout: "rest" as const,  // activity_logs not yet in scope
      isToday: date === todayStr,
    };
  });
}
