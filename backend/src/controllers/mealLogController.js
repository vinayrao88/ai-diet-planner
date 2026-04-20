import MealLog from "../models/MealLog.js";

export const toggleMeal = async (req, res) => {
  try {
    const { mealType, eaten } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    if (!mealType || typeof eaten !== "boolean") {
      return res.status(400).json({ message: "mealType and eaten are required" });
    }

    const log = await MealLog.findOneAndUpdate(
      { user: req.user.id, mealType, date: today },
      { eaten, date: today, user: req.user.id, mealType },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    res.json(log);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update meal status",
      error: error.message,
    });
  }
};

export const getTodayMeals = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const meals = await MealLog.find({
      user: req.user.id,
      date: today,
    });

    res.json(meals);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch today's meals",
      error: error.message,
    });
  }
};
