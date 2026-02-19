import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProgressLog", progressSchema);
