import MealLog from "../models/MealLog.js";

 export const toggleMeal = async (req, res) => {
  try {
    const { mealType, eaten } = req.body;

    const log = await MealLog.findOneAndUpdate(
      { user: req.user.id, mealType },
      { eaten },
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
  const today = new Date().toISOString().slice(0, 10);

  const meals = await MealLog.find({
    user: req.user.id,
    date: today,
  });

  res.json(meals);
};
