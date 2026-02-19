import DietPlan from "../models/DietPlan.js";
import User from "../models/User.js";
import { calculateBMR, activityMultiplier } from "../utils/bmr.js";
import { generateDietPlan } from "../services/aiDietService.js";

/**
 * Generate a new diet plan for logged-in user
 */
export const generateDiet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 SAFE DEFAULTS (important for demo & stability)
    const safeUser = {
      weight: user.weight || 70,
      height: user.height || 170,
      age: user.age || 22,
      gender: user.gender || "male",
      activityLevel: user.activityLevel || "moderate",
      dietPreference: user.dietPreference || "vegetarian",
      allergies: user.allergies || [],
    };

    // BMR + TDEE
    const bmr = calculateBMR(safeUser);
    const tdee = Math.round(bmr * activityMultiplier(safeUser.activityLevel));

    // AI diet generation
    const plan = generateDietPlan({
      calories: tdee,
      preference: safeUser.dietPreference,
      allergies: safeUser.allergies,
    });

    // Save diet plan
    const today = new Date().toISOString().slice(0, 10);
    const savedPlan = await DietPlan.findOneAndUpdate(
    { user: user._id, date: today },
  {
    user: user._id,
    date: today,
    totalCalories: plan.totalCalories,
    macros: plan.macros,
    meals: plan.meals,
  },
  {
    upsert: true,
    returnDocument: "after",
  }
);


    return res.json(savedPlan);
  } catch (err) {
    console.error("Generate diet error:", err);
    return res.status(500).json({ message: "Diet generation failed" });
  }
};

/**
 * Get latest diet plan for logged-in user
 */
export const currentDiet = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    return res.json(plan);
  } catch (err) {
    console.error("Fetch diet error:", err);
    return res.status(500).json({ message: "Failed to fetch diet" });
  }
};
export const dietHistory = async (req, res) => {
  try {
    const plans = await DietPlan.aggregate([
      { $match: { user: req.user.id } },

      // 🔥 createdAt se YYYY-MM-DD nikaalo
      {
        $addFields: {
          day: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
        },
      },

      // 🔥 same day ke plans ko group karo
      {
        $group: {
          _id: "$day",
          totalCalories: { $last: "$totalCalories" },
          createdAt: { $last: "$createdAt" },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
