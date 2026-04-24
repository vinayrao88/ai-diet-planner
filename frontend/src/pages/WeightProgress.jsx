import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function WeightProgress() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState("");
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const profile = await api.get("/users/me");
      if (!profile.data?.profileComplete) {
        navigate("/profile", { replace: true });
        return;
      }
      const res = await api.get("/progress");
      setProgress(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveWeight = async () => {
    try {
      if (!weight) {
        setError("Please enter weight");
        return;
      }
      setSaving(true);
      setError("");
      await api.post("/progress/weight", { weight: Number(weight) });
      const res = await api.get("/progress");
      setProgress(Array.isArray(res.data) ? res.data : []);
      setWeight("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save weight");
    } finally {
      setSaving(false);
    }
  };

  const latestWeight =
    progress.length > 0 ? progress[progress.length - 1].weight : null;

  const chartData = {
    labels: progress.map((p) => p.date),
    datasets: [
      {
        label: "Weight (kg)",
        data: progress.map((p) => p.weight),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.2)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6faf6]">
        <div className="rounded-xl bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Loading progress...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6faf6] px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Weight Progress</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">Latest Logged Weight</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {latestWeight ? `${latestWeight} kg` : "N/A"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">Update Today&apos;s Weight</p>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                min="20"
                max="300"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="Enter weight (kg)"
              />
              <button
                onClick={saveWeight}
                disabled={saving}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Weight Trend</h2>
          {progress.length === 0 ? (
            <p className="text-sm text-slate-500">No weight history yet.</p>
          ) : (
            <Line data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
}
