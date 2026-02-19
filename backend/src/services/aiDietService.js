export const generateDietPlan = ({ calories, preference, allergies = [] }) => {
  const avoid = new Set(allergies.map(a => a.toLowerCase()));

  const meals = {
    breakfast: ["Oats + Milk", "Poha", "Upma"],
    lunch: ["Dal + Rice + Salad", "Rajma + Rice"],
    snacks: ["Roasted Chana", "Fruit Bowl"],
    dinner: ["Roti + Sabzi + Curd"],
  };

  // simple filter demo (extend later)
  if (avoid.has("milk")) meals.breakfast = meals.breakfast.filter(m => !m.toLowerCase().includes("milk"));

  return {
    totalCalories: calories,
    macros: {
      protein: Math.round((calories * 0.3) / 4),
      carbs: Math.round((calories * 0.5) / 4),
      fats: Math.round((calories * 0.2) / 9),
    },
    meals,
  };
};
