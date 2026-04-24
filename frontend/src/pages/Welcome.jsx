import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/users/me")
      .then((res) => {
        navigate(res.data?.profileComplete ? "/dashboard" : "/profile", {
          replace: true,
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f7faf7] to-[#eef3ee] px-4">
      
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
          🌿
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          NutriMind AI
        </h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          Your personalized AI-powered diet planner with budget-friendly Indian meals.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-4 mt-6">
        <Link
          to="/login"
          className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 rounded-lg border border-green-600 text-green-700 font-semibold hover:bg-green-50 transition"
        >
          Register
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl w-full">
        {[
          {
            icon: "🎯",
            title: "Goal Based",
            desc: "Fat loss, muscle gain or maintenance plans."
          },
          {
            icon: "🍛",
            title: "Indian Meals",
            desc: "Dal, roti, rice – affordable & realistic."
          },
          {
            icon: "🧠",
            title: "AI Powered",
            desc: "Calories & macros calculated automatically."
          }
        ].map((f, i) => (
          <div
            key={i}
            className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-sm hover:shadow-md transition text-center border border-slate-100"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-gray-600 text-sm mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
