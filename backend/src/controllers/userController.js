import User from "../models/User.js";
import {
  calculateBMI,
  calculateMaintenanceCalories,
  normalizeGender,
  normalizeGoal,
} from "../utils/bmr.js";
import {
  generateAndSaveDietForUser,
  getProfileCompleteness,
} from "../services/dietEngineService.js";

const normalizePreference = (value = "") => {
  const p = String(value).trim().toLowerCase();
  if (p === "vegetarian" || p === "veg") return "veg";
  if (p === "eggetarian" || p === "egg") return "egg";
  if (p === "nonveg" || p === "non-vegetarian") return "nonveg";
  return p || "veg";
};

const normalizeActivity = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  if (["sedentary", "light", "moderate", "active", "athlete"].includes(normalized)) {
    return normalized;
  }
  return "sedentary";
};

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const updateProfile = async (req, res) => {
  try {
    const incoming = req.body || {};
    const payload = {
      age: safeNumber(incoming.age),
      gender: incoming.gender ? normalizeGender(incoming.gender) : undefined,
      height: safeNumber(incoming.height),
      weight: safeNumber(incoming.weight),
      activityLevel: incoming.activityLevel
        ? normalizeActivity(incoming.activityLevel)
        : undefined,
      goal: incoming.goal ? normalizeGoal(incoming.goal) : undefined,
      dietPreference: incoming.dietPreference
        ? normalizePreference(incoming.dietPreference)
        : undefined,
      allergies: Array.isArray(incoming.allergies)
        ? incoming.allergies.map((v) => String(v).trim()).filter(Boolean)
        : undefined,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const updated = await User.findByIdAndUpdate(req.user.id, payload, {
      returnDocument: "after",
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // Profile update should immediately impact diet output.
    await generateAndSaveDietForUser({
      user: updated,
      forceRegenerate: true,
    });

    const meta = getProfileCompleteness(updated);
    const bmi = calculateBMI(updated);
    const maintenanceCalories = meta.profileComplete
      ? Math.round(calculateMaintenanceCalories(updated))
      : null;

    res.json({
      ...updated.toObject(),
      profileComplete: meta.profileComplete,
      missingFields: meta.missingFields,
      bmi: bmi || null,
      maintenanceCalories,
    });
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email age gender height weight activityLevel goal dietPreference allergies"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const meta = getProfileCompleteness(user);
    const bmi = calculateBMI(user);
    const maintenanceCalories = meta.profileComplete
      ? Math.round(calculateMaintenanceCalories(user))
      : null;

    res.json({
      ...user.toObject(),
      profileComplete: meta.profileComplete,
      missingFields: meta.missingFields,
      bmi: bmi || null,
      maintenanceCalories,
    });
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
