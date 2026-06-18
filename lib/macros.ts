import type { Food, MealEntry, Recipe } from "./types";

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export const ZERO_MACROS: Macros = { kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

/**
 * Compute macros for a food amount. Foods in g/ml store values per 100 g/ml;
 * foods in "unidad" store values per 1 unit.
 */
export function macrosForFood(food: Food, amount: number): Macros {
  const r = food.unit === "unidad" ? amount : amount / 100;
  return {
    kcal: food.kcal * r,
    protein: food.protein * r,
    carbs: food.carbs * r,
    fats: food.fats * r,
    fiber: food.fiber * r,
  };
}

export function recipeMacrosPer100(recipe: Recipe, foods: Food[]): Macros & { totalWeight: number } {
  let kcal = 0, protein = 0, carbs = 0, fats = 0, fiber = 0;
  for (const ing of recipe.ingredients) {
    const food = foods.find((f) => f.id === ing.foodId);
    if (!food) continue;
    const m = macrosForFood(food, ing.grams);
    kcal += m.kcal; protein += m.protein; carbs += m.carbs; fats += m.fats; fiber += m.fiber;
  }
  if (recipe.unit === "unidad") {
    return {
      kcal,
      protein,
      carbs,
      fats,
      fiber,
      totalWeight: recipe.finalWeight,
    };
  }
  const fw = recipe.finalWeight || 1;
  const ratio = 100 / fw;
  return {
    kcal: kcal * ratio,
    protein: protein * ratio,
    carbs: carbs * ratio,
    fats: fats * ratio,
    fiber: fiber * ratio,
    totalWeight: recipe.finalWeight,
  };
}

/** Resolve the display name + macros for a meal entry (food or recipe). */
export function macrosForEntry(
  entry: MealEntry,
  foods: Food[],
  recipes: Recipe[]
): Macros & { name: string; isRecipe: boolean } {
  if (entry.foodId) {
    const food = foods.find((f) => f.id === entry.foodId);
    if (!food) return { ...ZERO_MACROS, name: "—", isRecipe: false };
    return { ...macrosForFood(food, entry.grams), name: food.name, isRecipe: false };
  }
  if (entry.recipeId) {
    const recipe = recipes.find((r) => r.id === entry.recipeId);
    if (!recipe) return { ...ZERO_MACROS, name: "—", isRecipe: true };
    const per100 = recipeMacrosPer100(recipe, foods);
    const r = recipe.unit === "unidad" ? entry.grams : entry.grams / 100;
    return {
      kcal: per100.kcal * r,
      protein: per100.protein * r,
      carbs: per100.carbs * r,
      fats: per100.fats * r,
      fiber: per100.fiber * r,
      name: recipe.name,
      isRecipe: true,
    };
  }
  return { ...ZERO_MACROS, name: "—", isRecipe: false };
}

/** Sum of all entries for a day. */
export function sumEntries(entries: MealEntry[], foods: Food[], recipes: Recipe[]): Macros {
  return entries.reduce<Macros>((acc, e) => {
    const m = macrosForEntry(e, foods, recipes);
    acc.kcal += m.kcal; acc.protein += m.protein; acc.carbs += m.carbs; acc.fats += m.fats; acc.fiber += m.fiber;
    return acc;
  }, { ...ZERO_MACROS });
}
