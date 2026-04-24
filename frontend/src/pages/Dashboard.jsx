import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MEAL_TYPES = ["breakfast", "lunch", "snacks", "dinner"];

function Ring({ value, total, label, color }) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const r = 38;
  const stroke = 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-1 text-lg font-bold text-slate-900">{percent}%</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

const emptyTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [diet, setDiet] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async ({ forceRegenerate = false } = {}) => {
    try {
      setError("");
      if (forceRegenerate) setRegenerating(true);
      else setLoading(true);

      const profileRes = await api.get("/users/me");
      const user = profileRes.data;
      setProfile(user);

      if (!user?.profileComplete) {
        navigate("/profile", { replace: true });
        return;
      }

      if (forceRegenerate) {
        await api.post("/diet/generate?force=true");
      }

      const [dietRes, mealsRes] = await Promise.all([
        api.get("/diet/current"),
        api.get("/meals/today"),
      ]);

      setDiet(dietRes.data || null);
      setMealLogs(Array.isArray(mealsRes.data) ? mealsRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMealStatus = (mealType) => mealLogs.find((m) => m.mealType === mealType)?.eaten;

  const toggleMeal = async (mealType, eaten) => {
    setMealLogs((prev) => {
      const withoutCurrent = prev.filter((m) => m.mealType !== mealType);
      return [...withoutCurrent, { mealType, eaten }];
    });

    try {
      await api.post("/meals/toggle", { mealType, eaten });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update meal status");
    }
  };

  const mealNutrition = diet?.mealNutrition || {};
  const consumedTotals = mealLogs.reduce((acc, log) => {
    if (!log?.eaten) return acc;
    const meal = mealNutrition[log.mealType] || emptyTotals;
    return {
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
    };
  }, emptyTotals);

  const eatenCount = mealLogs.filter((m) => m?.eaten).length;
  const compliance = Math.round((eatenCount / MEAL_TYPES.length) * 100) || 0;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6faf6]">
        <div className="rounded-xl bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Loading your personalized dashboard...
        </div>
      </div>
    );
  }

  if (!diet) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6faf6] p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-lg">
          <h2 className="text-xl font-bold text-slate-800">No diet plan found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Generate your first personalized plan from profile data.
          </p>
          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <button
            onClick={() => loadDashboard({ forceRegenerate: true })}
            className="mt-5 rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white hover:bg-green-700"
          >
            Generate Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fbf7] to-[#eef3ef]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700">NutriMind AI</h1>
            <p className="text-xs text-slate-500">Dynamic AI Diet Dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/weight")}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Weight Progress
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 px-6 py-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-lg lg:col-span-2">
            <p className="text-sm text-green-100">Target Calories</p>
            <h2 className="mt-1 text-5xl font-bold">{diet.totalCalories}</h2>
            <p className="text-sm text-green-100">kcal / day</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Protein Target" value={`${diet.macros?.protein || 0} g`} />
              <Metric label="Carbs Target" value={`${diet.macros?.carbs || 0} g`} />
              <Metric label="Fats Target" value={`${diet.macros?.fats || 0} g`} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Health Snapshot</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">BMI:</span>{" "}
                {diet.bmi || profile?.bmi || "N/A"}{" "}
                <span className="text-xs text-slate-500">
                  ({diet.bmiCategory || "Not available"})
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-800">BMR:</span> {diet.bmr || "N/A"} kcal
              </p>
              <p>
                <span className="font-semibold text-slate-800">Maintenance:</span>{" "}
                {diet.maintenanceCalories || profile?.maintenanceCalories || "N/A"} kcal
              </p>
              <p>
                <span className="font-semibold text-slate-800">Goal:</span> {diet.goal || "maintain"}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Preference:</span>{" "}
                {diet.dietPreference || profile?.dietPreference || "veg"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Today&apos;s Meal Plan</h3>
              <button
                onClick={() => loadDashboard({ forceRegenerate: true })}
                disabled={regenerating}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {regenerating ? "Regenerating..." : "Regenerate Plan"}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {MEAL_TYPES.map((mealType) => {
                const status = getMealStatus(mealType);
                const mealItems = Array.isArray(diet?.meals?.[mealType])
                  ? diet.meals[mealType]
                  : [];
                const nutrition = mealNutrition[mealType] || emptyTotals;

                return (
                  <div
                    key={mealType}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold capitalize text-green-700">{mealType}</h4>
                      <span className="text-xs text-slate-500">{nutrition.calories || 0} kcal</span>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm text-slate-700">
                      {mealItems.length ? (
                        mealItems.map((item, idx) => {
                          const name = typeof item === "string" ? item : item?.name;
                          const calories = typeof item === "string" ? null : item?.calories;
                          return (
                            <li key={`${name}-${idx}`} className="flex justify-between gap-3">
                              <span>{name}</span>
                              {calories ? <span className="text-slate-500">{calories} kcal</span> : null}
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-slate-400">No items available</li>
                      )}
                    </ul>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => toggleMeal(mealType, true)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === true
                            ? "bg-green-600 text-white"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-green-50"
                        }`}
                      >
                        Eaten
                      </button>
                      <button
                        onClick={() => toggleMeal(mealType, false)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === false
                            ? "bg-rose-600 text-white"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-rose-50"
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

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">Macro Progress</h3>
              <div className="mt-5 flex justify-between">
                <Ring
                  value={consumedTotals.protein}
                  total={diet.plannedMacros?.protein || diet.macros?.protein || 1}
                  label="Protein"
                  color="#7c3aed"
                />
                <Ring
                  value={consumedTotals.carbs}
                  total={diet.plannedMacros?.carbs || diet.macros?.carbs || 1}
                  label="Carbs"
                  color="#f59e0b"
                />
                <Ring
                  value={consumedTotals.fats}
                  total={diet.plannedMacros?.fats || diet.macros?.fats || 1}
                  label="Fats"
                  color="#ef4444"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">Today&apos;s Compliance</h3>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-green-600 transition-all" style={{ width: `${compliance}%` }} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-700">{compliance}% followed</p>
              <p className="mt-1 text-xs text-slate-500">
                Consumed: {Math.round(consumedTotals.calories)} / {diet.totalCalories} kcal
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2 text-sm backdrop-blur-sm">
      <p className="text-green-100">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}
