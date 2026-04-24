import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/utils/db.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const RETRY_BASE_MS = Number(process.env.DB_RETRY_BASE_MS || 5000);
const RETRY_MAX_MS = Number(process.env.DB_RETRY_MAX_MS || 30000);

const startDbWithRetry = async (attempt = 1) => {
  try {
    await connectDB();
  } catch (err) {
    const delay = Math.min(RETRY_BASE_MS * attempt, RETRY_MAX_MS);
    console.error("MongoDB connection failed ❌");
    console.error(err.message);
    console.error(
      `Retrying MongoDB connection in ${Math.round(delay / 1000)}s (attempt ${attempt})`
    );

    setTimeout(() => {
      startDbWithRetry(attempt + 1);
    }, delay);
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startDbWithRetry();
});
