 import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mealLogRoutes from "./routes/mealLogRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

const app = express();

// 🔥 FINAL CORS FIX (Authorization header allowed)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 IMPORTANT: explicitly handle OPTIONS
app.options("*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealLogRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

export default app;
