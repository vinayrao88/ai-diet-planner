import mongoose from "mongoose";

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "snacks", "dinner"],
      required: true,
    },
    eaten: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MealLog", mealLogSchema);
