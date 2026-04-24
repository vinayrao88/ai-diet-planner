const GOAL_ALIASES = {
  "fat-loss": "fat-loss",
  cut: "fat-loss",
  loss: "fat-loss",
  "weight-loss": "fat-loss",
  "muscle-gain": "gain",
  "weight-gain": "gain",
  gain: "gain",
  bulk: "gain",
  maintain: "maintain",
  maintenance: "maintain",
};

export const normalizeGoal = (goal = "") =>
  GOAL_ALIASES[String(goal).trim().toLowerCase()] || "maintain";

export const normalizeGender = (gender = "") => {
  const value = String(gender).trim().toLowerCase();
  return value === "female" ? "female" : "male";
};

export const calculateBMI = ({ weight, height }) => {
  const hMeters = Number(height) / 100;
  if (!hMeters || Number.isNaN(hMeters) || !weight || Number(weight) <= 0) {
    return 0;
  }
  return Number((Number(weight) / (hMeters * hMeters)).toFixed(1));
};

export const bmiCategory = (bmi) => {
  if (!bmi || Number.isNaN(bmi)) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export const calculateBMR = ({ weight, height, age, gender }) => {
  const normalizedGender = normalizeGender(gender);
  const w = Number(weight) || 0;
  const h = Number(height) || 0;
  const a = Number(age) || 0;

  return normalizedGender === "male"
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161;
};

export const activityMultiplier = (level) => {
  const map = {
    sedentary: 1.2,
    light: 1.35,
    moderate: 1.55,
    active: 1.75,
    athlete: 1.9,
  };
  return map[String(level || "").toLowerCase()] || 1.2;
};

export const calculateMaintenanceCalories = (profile) => {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * activityMultiplier(profile.activityLevel));
};

export const calculateTargetCalories = ({ maintenanceCalories, goal }) => {
  const normalizedGoal = normalizeGoal(goal);
  const base = Number(maintenanceCalories) || 0;

  let target = base;
  if (normalizedGoal === "fat-loss") target = base - 400;
  if (normalizedGoal === "gain") target = base + 300;

  return Math.min(4200, Math.max(1200, Math.round(target)));
};

export const calculateTargetMacros = ({ targetCalories, weight, goal }) => {
  const normalizedGoal = normalizeGoal(goal);
  const w = Number(weight) || 70;

  const proteinPerKg =
    normalizedGoal === "fat-loss" ? 1.9 : normalizedGoal === "gain" ? 2.1 : 1.7;
  const protein = Math.max(65, Math.round(w * proteinPerKg));
  const fats = Math.max(40, Math.round(w * 0.8));
  const caloriesAfterProteinAndFats = targetCalories - protein * 4 - fats * 9;
  const carbs = Math.max(80, Math.round(caloriesAfterProteinAndFats / 4));

  return { protein, carbs, fats };
};
