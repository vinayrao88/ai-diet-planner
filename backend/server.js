import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // 👈 THIS WAS MISSING (MAIN ISSUE)

import app from "./src/app.js";
import connectDB from "./src/utils/db.js";

const PORT = process.env.PORT || 4000;
app.use("/api/auth", authRoutes);

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
