import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Ring({ value, total, label, color }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  const r = 42;
  const stroke = 8;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110">
        <circle cx="55" cy="55" r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
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
      <p className="mt-1 text-lg font-bold">{percent}%</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

const normalizeMealItems = (items = []) =>
  items.map((item) => (typeof item === "string" ? { name: item } : item));

export default function Dashboard() {
  const navigate = useNavigate();
  const [diet, setDiet] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileMeta, setProfileMeta] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await api.get("/users/me");
        setProfileMeta(profileRes.data || null);
        if (!profileRes.data?.profileComplete) {
          navigate("/profile");
          return;
        }

        const [dietRes, mealsRes] = await Promise.all([
          api.get("/diet/current"),
          api.get("/meals/today"),
        ]);
        setDiet(dietRes.data || null);
        setMealLogs(mealsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      }
    };

    loadData();
  }, [navigate]);

  const generateDiet = async () => {
    try {
      setLoading(true);
      setError("");
      await api.post("/diet/generate?force=true");
      const res = await api.get("/diet/current");
      setDiet(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate diet plan");
    } finally {
      setLoading(false);
    }
  };

  const getMealStatus = (meal) => mealLogs.find((m) => m.mealType === meal)?.eaten;

  const toggleMeal = async (meal, eaten) => {
    setMealLogs((prev) => {
      const filtered = prev.filter((m) => m.mealType !== meal);
      return [...filtered, { mealType: meal, eaten }];
    });

    try {
      await api.post("/meals/toggle", { mealType: meal, eaten });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update meal status");
    }
  };

  const consumed = mealLogs.reduce(
    (acc, log) => {
      if (!log.eaten) return acc;
      const mealData = diet?.mealNutrition?.[log.mealType];
      if (!mealData) return acc;
      return {
        protein: acc.protein + (mealData.protein || 0),
        carbs: acc.carbs + (mealData.carbs || 0),
        fats: acc.fats + (mealData.fats || 0),
      };
    },
    { protein: 0, carbs: 0, fats: 0 }
  );

  const totalMeals = diet?.meals ? Object.keys(diet.meals).length : 0;
  const eatenMeals = mealLogs.filter((m) => m.eaten).length;
  const compliance = totalMeals ? Math.round((eatenMeals / totalMeals) * 100) : 0;

  if (!diet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbf8]">
        <div className="text-center">
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <button
            onClick={generateDiet}
            className="rounded-xl bg-green-600 px-8 py-4 text-lg text-white shadow-lg hover:bg-green-700"
          >
            {loading ? "Generating..." : "Generate Diet Plan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-green-700">NutriMind AI</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="font-semibold text-gray-600 hover:text-green-700"
            >
              Profile
            </button>
            <button
              onClick={() => navigate("/weight")}
              className="font-semibold text-gray-600 hover:text-green-700"
            >
              Weight Progress
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-3xl bg-[#f1f6ed] p-8 shadow-sm">
            <p className="text-gray-600">Daily Target</p>
            <h2 className="mt-1 text-5xl font-bold text-green-700">{diet.totalCalories}</h2>
            <p className="text-gray-500">calories / day</p>

            <div className="mt-6 flex flex-wrap gap-8 text-sm font-semibold">
              <span className="text-purple-600">Protein {diet.macros?.protein || 0}g</span>
              <span className="text-yellow-600">Carbs {diet.macros?.carbs || 0}g</span>
              <span className="text-red-600">Fats {diet.macros?.fats || 0}g</span>
              <span className="text-blue-600">BMI {diet.bmi || profileMeta?.bmi || "N/A"}</span>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold">Today’s Meals</h2>
            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Object.keys(diet.meals || {}).map((meal) => {
                const status = getMealStatus(meal);
                return (
                  <div
                    key={meal}
                    className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <h3 className="mb-3 text-lg font-semibold capitalize text-green-700">{meal}</h3>
                    <ul className="mb-4 list-inside list-disc text-sm text-gray-600">
                      {normalizeMealItems(diet.meals[meal] || []).map((item, i) => (
                        <li key={`${item.name}-${i}`}>{item.name}</li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleMeal(meal, true)}
                        className={`rounded-full px-4 py-1 text-sm font-semibold ${
                          status === true ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-green-100"
                        }`}
                      >
                        Eaten
                      </button>
                      <button
                        onClick={() => toggleMeal(meal, false)}
                        className={`rounded-full px-4 py-1 text-sm font-semibold ${
                          status === false ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-red-100"
                        }`}
                      >
                        Skipped
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold">Macro Split</h2>
            <div className="flex justify-between">
              <Ring
                value={consumed.protein}
                total={diet.macros?.protein || 0}
                label="Protein"
                color="#7c3aed"
              />
              <Ring
                value={consumed.carbs}
                total={diet.macros?.carbs || 0}
                label="Carbs"
                color="#f59e0b"
              />
              <Ring
                value={consumed.fats}
                total={diet.macros?.fats || 0}
                label="Fats"
                color="#ef4444"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-bold">Today’s Compliance</h2>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-green-600 transition-all" style={{ width: `${compliance}%` }} />
            </div>
            <p className="mt-2 font-semibold text-gray-700">{compliance}% followed</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <button
              onClick={generateDiet}
              className="w-full rounded-xl bg-green-600 py-3 text-lg text-white hover:bg-green-700"
            >
              {loading ? "Generating..." : "Regenerate Plan"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
