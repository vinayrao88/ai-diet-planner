 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* =========================
   Macro Ring Component
========================= */
function Ring({ value, total, label, color }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  const r = 42;
  const stroke = 8;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110">
        <circle
          cx="55"
          cy="55"
          r={r}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx="55"
          cy="55"
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className="text-lg font-bold mt-1">{percent}%</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

/* =========================
   Dashboard Page
========================= */
export default function Dashboard() {
  const navigate = useNavigate();

  const [diet, setDiet] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Load Data ---------- */
  useEffect(() => {
    api.get("/diet/current").then(res => setDiet(res.data));
    api.get("/meals/today").then(res => setMealLogs(res.data));
  }, []);

  /* ---------- Generate Diet ---------- */
  const generateDiet = async () => {
    setLoading(true);
    await api.post("/diet/generate");
    const res = await api.get("/diet/current");
    setDiet(res.data);
    setLoading(false);
  };

  /* ---------- Meal Helpers ---------- */
  const getMealStatus = meal =>
    mealLogs.find(m => m.mealType === meal)?.eaten;
   const toggleMeal = async (meal, eaten) => {
  // Optimistic UI update
  setMealLogs(prev => {
    const filtered = prev.filter(m => m.mealType !== meal);
    return [...filtered, { mealType: meal, eaten }];
  });

  // Backend sync
  await api.post("/meals/toggle", { mealType: meal, eaten });
};

   /* ---------- Dynamic Nutrition (REAL) ---------- */

let consumedCalories = 0;
let consumedProtein = 0;
let consumedCarbs = 0;
let consumedFats = 0;

mealLogs.forEach(log => {
  if (!log.eaten) return;

  const mealItems = diet.meals[log.mealType] || [];

  // simple estimation per item (safe + explainable)
  const caloriesPerItem = Math.round(diet.totalCalories / 10);
  const proteinPerItem = Math.round(diet.macros.protein / 10);
  const carbsPerItem = Math.round(diet.macros.carbs / 10);
  const fatsPerItem = Math.round(diet.macros.fats / 10);

  consumedCalories += caloriesPerItem * mealItems.length;
  consumedProtein += proteinPerItem * mealItems.length;
  consumedCarbs += carbsPerItem * mealItems.length;
  consumedFats += fatsPerItem * mealItems.length;
});

/* ---------- Compliance ---------- */
const totalMeals = Object.keys(diet.meals).length;
const eatenMeals = mealLogs.filter(m => m.eaten).length;

const compliance = totalMeals
  ? Math.round((eatenMeals / totalMeals) * 100)
  : 0;

  /* ---------- Empty State ---------- */
  if (!diet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbf8]">
        <button
          onClick={generateDiet}
          className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg shadow-lg hover:bg-green-700"
        >
          Generate Diet Plan
        </button>
      </div>
    );
  }

  /* =========================
     UI STARTS HERE
  ========================= */
  return (
    <div className="min-h-screen bg-[#fbfbf8]">
      {/* ---------- Navbar ---------- */}
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">
            NutriPlan
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-green-700 font-semibold"
            >
              Profile
            </button>
            <button
              onClick={() => navigate("/weight")}
              className="text-gray-600 hover:text-green-700 font-semibold"
            >
              Weight Progress
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Main Layout ---------- */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* Calories Card */}
          <div className="bg-[#f1f6ed] rounded-3xl p-8 shadow-sm">
            <p className="text-gray-600">Daily Target</p>
            <h2 className="text-5xl font-bold text-green-700 mt-1">
              {diet.totalCalories}
            </h2>
            <p className="text-gray-500">calories / day</p>

            <div className="flex gap-8 mt-6 text-sm font-semibold">
              <span className="text-purple-600">
                Protein {diet.macros.protein}g
              </span>
              <span className="text-yellow-600">
                Carbs {diet.macros.carbs}g
              </span>
              <span className="text-red-600">
                Fats {diet.macros.fats}g
              </span>
            </div>
          </div>

          {/* Meals */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Today’s Meals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(diet.meals).map(meal => {
                const status = getMealStatus(meal);

                return (
                  <div
                    key={meal}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold capitalize mb-3 text-green-700">
                      {meal}
                    </h3>

                    <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                      {diet.meals[meal].map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>

                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleMeal(meal, true)}
                        className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          status === true
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 hover:bg-green-100"
                        }`}
                      >
                        ✓ Eaten
                      </button>

                      <button
                        onClick={() => toggleMeal(meal, false)}
                        className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          status === false
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 hover:bg-red-100"
                        }`}
                      >
                        ✕ Skipped
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-8">
          {/* Macro Rings */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold mb-6 text-lg">
              Macro Split
            </h2>
            <div className="flex justify-between">
              <Ring
                value={consumedProtein * 4}
                total={diet.totalCalories}
                label="Protein"
                color="#7c3aed"
              />
              <Ring
                value={consumedCarbs * 4}
                total={diet.totalCalories}
                label="Carbs"
                color="#f59e0b"
              />
              <Ring
                value={consumedFats * 9}
                total={diet.totalCalories}
                label="Fats"
                color="#ef4444"
              />
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold mb-3">
              Today’s Compliance
            </h2>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${compliance}%` }}
              />
            </div>
            <p className="mt-2 font-semibold text-gray-700">
              {compliance}% followed
            </p>
          </div>

          {/* Regenerate */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <button
              onClick={generateDiet}
              className="w-full bg-green-600 text-white py-3 rounded-xl text-lg hover:bg-green-700"
            >
              {loading ? "Generating..." : "New Plan"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
