import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/register", form);
      if (data?.token) {
        localStorage.setItem("token", data.token);
        navigate(data?.user?.profileComplete ? "/dashboard" : "/profile");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] px-4 py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-green-100 bg-white shadow-xl">
        <div className="grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-8 text-white">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-green-100">
              NutriMind AI
            </p>
            <h1 className="text-3xl font-bold leading-tight">Create your account</h1>
            <p className="mt-4 text-green-50">
              Register first, then complete onboarding to unlock a truly personalized
              Indian diet plan based on your BMI, goal, and preferences.
            </p>
            <div className="mt-8 rounded-2xl bg-white/15 p-4 text-sm backdrop-blur-sm">
              Flow: Register to Profile Onboarding to Personalized Dashboard
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800">Sign Up</h2>
            <p className="mt-1 text-sm text-slate-500">
              Start your nutrition journey in less than 1 minute.
            </p>

            <form onSubmit={register} className="mt-6 space-y-4">
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="Vinay Kumar"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  value={form.password}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-green-700">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
