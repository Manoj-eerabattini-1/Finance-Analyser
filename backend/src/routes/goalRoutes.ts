import { Router } from "express";
import {
  createGoal,
  getGoals,
  getGoal,
  deleteGoal,
} from "../controllers/goalController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createGoalSchema } from "../validators/goalValidator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validateRequest(createGoalSchema), createGoal);
router.get("/", getGoals);
router.get("/:id", getGoal);
router.delete("/:id", deleteGoal);

export default router;
