import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  /* ================= DARK MODE ================= */
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "",
    goal: "",
    dietType: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    api.get("/users/me").then(res => {
      if (res.data) setForm(res.data);
    });
  }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= SAVE ================= */
   const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);

  try {
    await api.put("/users/me", form);
    setLoading(false);
    navigate("/dashboard");
  } catch (err) {
    console.error("Profile save failed:", err);
    alert("Failed to save profile");
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4 transition">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              👤 Profile Setup
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Personalize your AI diet plan
            </p>
          </div>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={() => setDark(!dark)}
            className="text-xl"
            title="Toggle Theme"
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC INFO */}
          <Section title="🧍 Basic Info">
            <Input
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              type="number"
            />

            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={["Male", "Female"]}
              placeholder="Gender"
            />
          </Section>

          {/* BODY */}
          <Section title="📏 Body Metrics">
            <Input
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="Height (cm)"
              type="number"
            />
            <Input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Weight (kg)"
              type="number"
            />
          </Section>

          {/* LIFESTYLE */}
          <Section title="🏃 Lifestyle & Goals">
            <Select
              name="activity"
              value={form.activity}
              onChange={handleChange}
              options={["Sedentary", "Moderate", "Active"]}
              placeholder="Activity Level"
            />
            <Select
              name="goal"
              value={form.goal}
              onChange={handleChange}
              options={[
                "Weight Loss",
                "Weight Gain",
                "Maintenance",
              ]}
              placeholder="Goal"
            />
          </Section>

          {/* DIET */}
          <Section title="🥗 Diet Preference">
            <Select
              name="dietType"
              value={form.dietType}
              onChange={handleChange}
              options={[
                "Vegetarian",
                "Eggetarian",
                "Non-Vegetarian",
              ]}
              placeholder="Diet Type"
            />
          </Section>

          {/* ACTION */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg transition"
            >
              {loading ? "Saving..." : "Save & Continue →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-200">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
    />
  );
}

function Select({ options, placeholder, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
