import ProgressLog from "../models/ProgressLog.js";

export const addWeight = async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const log = await ProgressLog.findOneAndUpdate(
    { user: req.user.id, date: today },
    { weight: req.body.weight, date: today, user: req.user.id },
    { upsert: true, returnDocument: "after" }
  );

  res.json(log);
};

export const getProgress = async (req, res) => {
  const logs = await ProgressLog.find({ user: req.user.id }).sort({
    date: 1,
  });
  res.json(logs);
};
