import DietPlan from "../models/DietPlan.js";
import {
  bmiCategory,
  calculateBMI,
  calculateBMR,
  calculateMaintenanceCalories,
  calculateTargetCalories,
  calculateTargetMacros,
  normalizeGender,
  normalizeGoal,
} from "../utils/bmr.js";
import { generateDietPlanFromDataset } from "./aiDietService.js";

const normalizePreference = (value = "") => {
  const p = String(value).trim().toLowerCase();
  if (p === "vegetarian" || p === "veg") return "veg";
  if (p === "eggetarian" || p === "egg") return "egg";
  if (p === "nonveg" || p === "non-vegetarian") return "nonveg";
  if (!p) return "";
  return "nonveg";
};

const normalizeActivity = (value = "") => {
  const v = String(value).trim().toLowerCase();
  if (["sedentary", "light", "moderate", "active", "athlete"].includes(v)) {
    return v;
  }
  return "sedentary";
};

const toPositiveNumberOrZero = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const sanitizeUserProfile = (userDoc = {}) => ({
  age: Math.round(toPositiveNumberOrZero(userDoc.age)),
  gender: userDoc.gender ? normalizeGender(userDoc.gender) : "",
  height: toPositiveNumberOrZero(userDoc.height),
  weight: toPositiveNumberOrZero(userDoc.weight),
  activityLevel: userDoc.activityLevel ? normalizeActivity(userDoc.activityLevel) : "",
  goal: userDoc.goal ? normalizeGoal(userDoc.goal) : "",
  dietPreference: normalizePreference(userDoc.dietPreference),
  allergies: Array.isArray(userDoc.allergies)
    ? userDoc.allergies.map((v) => String(v).trim()).filter(Boolean)
    : [],
});

export const REQUIRED_PROFILE_FIELDS = [
  "age",
  "gender",
  "height",
  "weight",
  "activityLevel",
  "goal",
  "dietPreference",
];

export const getProfileCompleteness = (userDoc = {}) => {
  const p = sanitizeUserProfile(userDoc);
  const missing = [];

  if (!p.age || p.age < 10) missing.push("age");
  if (!userDoc.gender) missing.push("gender");
  if (!p.height || p.height < 100) missing.push("height");
  if (!p.weight || p.weight < 20) missing.push("weight");
  if (!p.activityLevel) missing.push("activityLevel");
  if (!p.goal) missing.push("goal");
  if (!p.dietPreference) missing.push("dietPreference");

  return {
    profileComplete: missing.length === 0,
    missingFields: missing,
    profile: p,
  };
};

const flattenPreviousMeals = (planDoc) => {
  if (!planDoc?.meals) return {};
  const result = {};
  for (const category of ["breakfast", "lunch", "snacks", "dinner"]) {
    const items = Array.isArray(planDoc.meals[category]) ? planDoc.meals[category] : [];
    result[category] = items.map((item) =>
      typeof item === "string" ? item : String(item?.name || "")
    );
  }
  return result;
};

export const generateAndSaveDietForUser = async ({
  user,
  date = new Date().toISOString().slice(0, 10),
  forceRegenerate = false,
}) => {
  const { profileComplete, missingFields, profile } = getProfileCompleteness(user);
  if (!profileComplete) {
    return {
      profileComplete: false,
      missingFields,
      plan: null,
    };
  }

  const existingPlan = await DietPlan.findOne({ user: user._id, date });
  if (existingPlan && !forceRegenerate) {
    return {
      profileComplete: true,
      missingFields: [],
      plan: existingPlan,
    };
  }

  const bmi = calculateBMI(profile);
  const bmr = Math.round(calculateBMR(profile));
  const maintenanceCalories = calculateMaintenanceCalories(profile);
  const targetCalories = calculateTargetCalories({
    maintenanceCalories,
    goal: profile.goal,
  });
  const targetMacros = calculateTargetMacros({
    targetCalories,
    weight: profile.weight,
    goal: profile.goal,
  });

  const generated = generateDietPlanFromDataset({
    targetCalories,
    preference: profile.dietPreference,
    allergies: profile.allergies,
    previousMeals: flattenPreviousMeals(existingPlan),
  });

  const payload = {
    user: user._id,
    date,
    bmr,
    bmi,
    bmiCategory: bmiCategory(bmi),
    maintenanceCalories,
    totalCalories: targetCalories,
    goal: profile.goal,
    dietPreference: profile.dietPreference,
    macros: targetMacros,
    plannedMacros: generated.planTotals,
    meals: generated.meals,
    mealNutrition: generated.mealNutrition,
  };

  const plan = await DietPlan.findOneAndUpdate(
    { user: user._id, date },
    payload,
    { upsert: true, returnDocument: "after" }
  );

  return {
    profileComplete: true,
    missingFields: [],
    plan,
  };
};
