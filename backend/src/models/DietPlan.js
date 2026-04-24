import mongoose from "mongoose";

const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalCalories: Number,
    maintenanceCalories: Number,
    bmr: Number,
    bmi: Number,
    bmiCategory: String,
    goal: String,
    dietPreference: String,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number,
    },
    plannedMacros: {
      protein: Number,
      carbs: Number,
      fats: Number,
    },
    mealNutrition: {
      breakfast: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
      },
      lunch: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
      },
      snacks: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
      },
      dinner: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
      },
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    meals: Object,
    weekStart: Date,
  },
  { timestamps: true }
);

dietPlanSchema.index({ user: 1, date: 1 });

export default mongoose.model("DietPlan", dietPlanSchema);
