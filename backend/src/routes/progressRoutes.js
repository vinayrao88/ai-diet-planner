import express from "express";
import { addWeight, getProgress } from "../controllers/progressController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/weight", auth, addWeight);
router.get("/", auth, getProgress);

export default router;
