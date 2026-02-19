import express from "express";
import { toggleMeal, getTodayMeals } from "../controllers/mealLogController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/today", auth, getTodayMeals);
router.post("/toggle", auth, toggleMeal);

export default router;
