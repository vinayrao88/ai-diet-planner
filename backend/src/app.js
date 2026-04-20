import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mealLogRoutes from "./routes/mealLogRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ainutriplanner.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealLogRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

export default app;
