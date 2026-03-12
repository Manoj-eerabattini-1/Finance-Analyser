import { Router } from "express";
import { createGoal, getGoals, getGoal, updateGoal, deleteGoal } from "../controllers/goalController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoal);
router.put("/:id", updateGoal);   // NEW — was missing
router.delete("/:id", deleteGoal);

export default router;