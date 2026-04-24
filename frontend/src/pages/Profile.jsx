import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  activityLevel: "",
  goal: "",
  dietPreference: "",
  allergies: "",
};

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        const data = res.data || {};
        setForm({
          age: data.age ?? "",
          gender: data.gender ?? "",
          height: data.height ?? "",
          weight: data.weight ?? "",
          activityLevel: data.activityLevel ?? "",
          goal: data.goal ?? "",
          dietPreference: data.dietPreference ?? "",
          allergies: Array.isArray(data.allergies) ? data.allergies.join(", ") : "",
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load profile");
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
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
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f6faf6]">
        <div className="rounded-xl bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6faf6] px-4 py-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100">
        <div className="bg-gradient-to-r from-green-700 to-emerald-500 px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-green-100">Onboarding</p>
          <h1 className="text-2xl font-bold">Complete Your Nutrition Profile</h1>
          <p className="mt-1 text-green-50">
            We use this data to calculate BMI, calorie target, and personalized meals.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-7 p-6 md:p-8">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <Section title="Body Metrics">
            <Input
              name="age"
              type="number"
              min={10}
              max={90}
              value={form.age}
              onChange={onChange}
              placeholder="Age"
              required
            />
            <Select
              name="gender"
              value={form.gender}
              onChange={onChange}
              placeholder="Gender"
              required
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
            />
            <Input
              name="height"
              type="number"
              min={120}
              max={230}
              value={form.height}
              onChange={onChange}
              placeholder="Height (cm)"
              required
            />
            <Input
              name="weight"
              type="number"
              min={25}
              max={250}
              value={form.weight}
              onChange={onChange}
              placeholder="Weight (kg)"
              required
            />
          </Section>

          <Section title="Lifestyle and Goal">
            <Select
              name="activityLevel"
              value={form.activityLevel}
              onChange={onChange}
              placeholder="Activity Level"
              required
              options={[
                { label: "Sedentary", value: "sedentary" },
                { label: "Lightly Active", value: "light" },
                { label: "Moderately Active", value: "moderate" },
                { label: "Active", value: "active" },
                { label: "Athlete", value: "athlete" },
              ]}
            />
            <Select
              name="goal"
              value={form.goal}
              onChange={onChange}
              placeholder="Goal"
              required
              options={[
                { label: "Fat Loss", value: "fat-loss" },
                { label: "Maintain", value: "maintain" },
                { label: "Weight / Muscle Gain", value: "gain" },
              ]}
            />
          </Section>

          <Section title="Food Preferences">
            <Select
              name="dietPreference"
              value={form.dietPreference}
              onChange={onChange}
              placeholder="Food Preference"
              required
              options={[
                { label: "Vegetarian", value: "veg" },
                { label: "Egg + Veg", value: "egg" },
                { label: "Non-Veg", value: "nonveg" },
              ]}
            />
            <Input
              name="allergies"
              value={form.allergies}
              onChange={onChange}
              placeholder="Allergies (optional, comma separated)"
            />
          </Section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Saving & Generating..." : "Save and Continue"}
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
      <h2 className="mb-3 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
    />
  );
}

function Select({ options, placeholder, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
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
