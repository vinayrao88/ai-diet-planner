import ProgressLog from "../models/ProgressLog.js";

export const addWeight = async (req, res) => {
  try {
    const weight = Number(req.body?.weight);
    if (!weight || Number.isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: "Valid weight is required" });
    }

    const today = new Date().toISOString().slice(0, 10);

    const log = await ProgressLog.findOneAndUpdate(
      { user: req.user.id, date: today },
      { weight, date: today, user: req.user.id },
      { upsert: true, returnDocument: "after" }
    );

    res.json(log);
  } catch (error) {
    res.status(500).json({
      message: "Failed to save weight progress",
      error: error.message,
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    const logs = await ProgressLog.find({ user: req.user.id }).sort({
      date: 1,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};
