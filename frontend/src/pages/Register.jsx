import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const register = async () => {
    try {
      await api.post("/auth/register", form);
      alert("Registered successfully. Login now.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Register</h2>

        <input
          style={input}
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={input}
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button style={button} onClick={register}>
          Register
        </button>

        <p style={text}>
          Already have an account?{" "}
          <a href="/" style={link}>Login</a>
        </p>
      </div>
    </div>
  );
}

/* styles (same as login) */
const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f4f5",
};

const card = {
  width: "320px",
  padding: "24px",
  borderRadius: "12px",
  background: "white",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const title = {
  fontSize: "22px",
  fontWeight: "bold",
  marginBottom: "20px",
  textAlign: "center",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #d4d4d8",
};

const button = {
  width: "100%",
  padding: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer",
};

const text = {
  marginTop: "14px",
  fontSize: "14px",
  textAlign: "center",
};

const link = {
  color: "#16a34a",
  textDecoration: "none",
};
