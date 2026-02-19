import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    activityLevel: String,
    goal: String,
    dietPreference: String,
    allergies: [String],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
