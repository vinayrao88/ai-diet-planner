import mongoose from "mongoose";

const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalCalories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number,
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

export default mongoose.model("DietPlan", dietPlanSchema);
