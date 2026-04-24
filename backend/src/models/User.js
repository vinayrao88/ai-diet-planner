import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    age: Number,
    gender: { type: String, enum: ["male", "female"] },
    height: Number,
    weight: Number,
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "athlete"],
    },
    goal: String,
    dietPreference: String,
    allergies: [String],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
