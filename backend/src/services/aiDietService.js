import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FOOD_DATA_PATH = path.resolve(__dirname, "../../data/food.json");

const FALLBACK_FOODS = [
  {
    name: "Oats with Milk",
    category: "breakfast",
    type: "veg",
    calories: 320,
    protein: 14,
    carbs: 45,
    fat: 9,
  },
  {
    name: "Dal Rice",
    category: "lunch",
    type: "veg",
    calories: 430,
    protein: 15,
    carbs: 68,
    fat: 9,
  },
  {
    name: "Roasted Chana",
    category: "snacks",
    type: "veg",
    calories: 180,
    protein: 9,
    carbs: 28,
    fat: 3,
  },
  {
    name: "Roti Sabzi",
    category: "dinner",
    type: "veg",
    calories: 390,
    protein: 12,
    carbs: 52,
    fat: 10,
  },
];

let cachedFoods = null;

const toNumber = (v) => {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeFood = (food) => ({
  name: String(food.name || "").trim(),
  category: String(food.category || "").trim().toLowerCase(),
  type: String(food.type || "veg").trim().toLowerCase(),
  calories: toNumber(food.calories),
  protein: toNumber(food.protein),
  carbs: toNumber(food.carbs),
  fats: toNumber(food.fats || food.fat),
  tags: Array.isArray(food.tags)
    ? food.tags.map((t) => String(t).toLowerCase())
    : [],
});

const readFoodsFromDisk = () => {
  try {
    const raw = fs.readFileSync(FOOD_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeFood) : [];
  } catch (error) {
    console.error("food.json parse error. Falling back to default food list.");
    return FALLBACK_FOODS.map(normalizeFood);
  }
};

export const getFoodsDataset = () => {
  if (!cachedFoods) {
    cachedFoods = readFoodsFromDisk().filter((food) => food.name && food.category);
  }
  return cachedFoods;
};

const allowedTypesForPreference = (preference = "") => {
  const p = String(preference).trim().toLowerCase();
  if (p === "veg" || p === "vegetarian") return new Set(["veg"]);
  if (p === "egg" || p === "eggetarian") return new Set(["veg", "egg"]);
  return new Set(["veg", "egg", "nonveg"]);
};

const getAllergyTokens = (allergies = []) =>
  allergies
    .flatMap((entry) => String(entry).toLowerCase().split(","))
    .map((token) => token.trim())
    .filter(Boolean);

const isFoodAllowed = ({ food, allowedTypes, allergyTokens }) => {
  if (!allowedTypes.has(food.type)) return false;
  if (!allergyTokens.length) return true;

  const haystack = `${food.name} ${(food.tags || []).join(" ")}`.toLowerCase();
  return !allergyTokens.some((token) => haystack.includes(token));
};

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const itemCountByCategory = {
  breakfast: 2,
  lunch: 2,
  snacks: 2,
  dinner: 2,
};

const mealShareByCategory = {
  breakfast: 0.25,
  lunch: 0.35,
  snacks: 0.15,
  dinner: 0.25,
};

const pickFoodsForMeal = ({
  mealFoods,
  mealCalorieTarget,
  previousMealNames = [],
  category,
}) => {
  if (!mealFoods.length) return [];

  const previous = new Set(previousMealNames.map((name) => name.toLowerCase()));

  const nonRepeated = mealFoods.filter(
    (food) => !previous.has(String(food.name).toLowerCase())
  );
  const source = nonRepeated.length ? nonRepeated : mealFoods;
  const candidates = shuffle(source);

  const maxItems = itemCountByCategory[category] || 2;
  const picked = [];
  let runningCalories = 0;
  const hardCap = mealCalorieTarget * 1.18;

  for (const food of candidates) {
    if (picked.length >= maxItems) break;
    if (!food.calories) continue;

    const nextCalories = runningCalories + food.calories;
    if (nextCalories <= hardCap || picked.length === 0) {
      picked.push(food);
      runningCalories = nextCalories;
    }
  }

  if (!picked.length) {
    const one = candidates[0];
    if (one) picked.push(one);
  }

  return picked;
};

const sumNutrition = (foods) =>
  foods.reduce(
    (acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

export const generateDietPlanFromDataset = ({
  targetCalories,
  preference,
  allergies = [],
  previousMeals = {},
}) => {
  const allFoods = getFoodsDataset();
  const allowedTypes = allowedTypesForPreference(preference);
  const allergyTokens = getAllergyTokens(allergies);

  const filtered = allFoods.filter((food) =>
    isFoodAllowed({ food, allowedTypes, allergyTokens })
  );

  const categories = ["breakfast", "lunch", "snacks", "dinner"];
  const meals = {};
  const mealNutrition = {};

  for (const category of categories) {
    const categoryFoods = filtered.filter((food) => food.category === category);

    // Fallback to all types for this category if strict filter becomes empty.
    const fallbackCategoryFoods =
      categoryFoods.length > 0
        ? categoryFoods
        : allFoods.filter((food) => food.category === category);

    const picked = pickFoodsForMeal({
      mealFoods: fallbackCategoryFoods,
      mealCalorieTarget: targetCalories * (mealShareByCategory[category] || 0.25),
      previousMealNames: previousMeals[category] || [],
      category,
    });

    meals[category] = picked;
    mealNutrition[category] = sumNutrition(picked);
  }

  const planTotals = sumNutrition(Object.values(meals).flat());

  return {
    meals,
    mealNutrition,
    planTotals: {
      calories: Math.round(planTotals.calories),
      protein: Math.round(planTotals.protein),
      carbs: Math.round(planTotals.carbs),
      fats: Math.round(planTotals.fats),
    },
  };
};
