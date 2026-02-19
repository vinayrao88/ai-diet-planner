import { useEffect, useState } from "react";
import api from "../services/api";

/* ===== Chart.js ===== */
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function WeightProgress() {
  const [weight, setWeight] = useState("");
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    api.get("/progress")
      .then(res => setProgress(res.data))
      .catch(() => {});
  }, []);

  const saveWeight = async () => {
    if (!weight) return alert("Enter weight");

    await api.post("/progress/weight", { weight });
    const res = await api.get("/progress");
    setProgress(res.data);
    setWeight("");
  };

  const latestWeight =
    progress.length > 0 ? progress[progress.length - 1].weight : "N/A";

  const chartData = {
    labels: progress.map(p => p.date),
    datasets: [
      {
        label: "Weight (kg)",
        data: progress.map(p => p.weight),
        borderColor: "#2563eb",
        backgroundColor: "#93c5fd",
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Weight Progress
      </h1>

      {/* Current Weight */}
      <div style={card}>
        <h3>Current Weight</h3>
        <p style={{ fontSize: "26px", fontWeight: "bold" }}>
          {latestWeight} kg
        </p>
      </div>

      {/* Update Weight */}
      <div style={card}>
        <h3>Update Weight</h3>
        <input
          type="number"
          placeholder="Enter weight (kg)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          style={input}
        />
        <button style={btnGreen} onClick={saveWeight}>
          Save Weight
        </button>
      </div>

      {/* Chart */}
      <div style={card}>
        <h3>Weight History (Chart)</h3>
        {progress.length === 0 ? (
          <p>No weight history yet.</p>
        ) : (
          <Line data={chartData} />
        )}
      </div>

      {/* History List */}
      <div style={card}>
        <h3>Weight History (Past → Present)</h3>

        {progress.length === 0 && <p>No history available.</p>}

        {progress.map((p, i) => (
          <div key={i} style={row}>
            <span>{p.date}</span>
            <b>{p.weight} kg</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const card = {
  background: "#f4f4f5",
  padding: "16px",
  borderRadius: "12px",
  marginTop: "20px",
};

const btnGreen = {
  padding: "10px 16px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
};

const input = {
  padding: "8px",
  width: "100%",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #d4d4d8",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #e5e7eb",
};
