import express from "express";
import auth from "../middleware/authMiddleware.js";
import { generateDiet, currentDiet, dietHistory } from "../controllers/dietController.js";

const router = express.Router();

router.post("/generate", auth, generateDiet);
router.get("/current", auth, currentDiet);
router.get("/history", auth, dietHistory);

export default router;
