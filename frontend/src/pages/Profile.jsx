import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    dietPreference: "",
    allergies: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        if (!res.data) return;
        setForm({
          age: res.data.age ?? "",
          gender: res.data.gender ?? "",
          height: res.data.height ?? "",
          weight: res.data.weight ?? "",
          activityLevel: res.data.activityLevel ?? "",
          goal: res.data.goal ?? "",
          dietPreference: res.data.dietPreference ?? "",
          allergies: (res.data.allergies || []).join(", "),
        });
      })
      .catch(() => {
        setError("Failed to load profile");
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put("/users/me", {
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: form.activityLevel,
        goal: form.goal,
        dietPreference: form.dietPreference,
        allergies: form.allergies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      navigate("/dashboard");
    } catch {
      setError("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 transition dark:bg-gray-900">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Setup</h1>
            <p className="text-gray-500 dark:text-gray-400">Personalize your AI diet plan</p>
          </div>
          <button onClick={() => setDark(!dark)} className="text-sm font-medium" type="button">
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Section title="Basic Info">
            <Input name="age" value={form.age} onChange={handleChange} placeholder="Age" type="number" />
            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              placeholder="Gender"
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
            />
          </Section>

          <Section title="Body Metrics">
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

          <Section title="Lifestyle & Goals">
            <Select
              name="activityLevel"
              value={form.activityLevel}
              onChange={handleChange}
              placeholder="Activity Level"
              options={[
                { label: "Sedentary", value: "sedentary" },
                { label: "Moderate", value: "moderate" },
                { label: "Active", value: "active" },
              ]}
            />
            <Select
              name="goal"
              value={form.goal}
              onChange={handleChange}
              placeholder="Goal"
              options={[
                { label: "Weight Loss", value: "weight-loss" },
                { label: "Weight Gain", value: "weight-gain" },
                { label: "Maintenance", value: "maintenance" },
              ]}
            />
          </Section>

          <Section title="Diet Preference">
            <Select
              name="dietPreference"
              value={form.dietPreference}
              onChange={handleChange}
              placeholder="Diet Type"
              options={[
                { label: "Vegetarian", value: "vegetarian" },
                { label: "Eggetarian", value: "eggetarian" },
                { label: "Non-Vegetarian", value: "non-vegetarian" },
              ]}
            />
            <Input
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="Allergies (comma separated)"
              type="text"
            />
          </Section>

          <div className="flex justify-end">
            <button className="rounded-xl bg-green-600 px-8 py-3 text-lg text-white hover:bg-green-700" type="submit">
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border bg-white px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  );
}

function Select({ options, placeholder, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border bg-white px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
