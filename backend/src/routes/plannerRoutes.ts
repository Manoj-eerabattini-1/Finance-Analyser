import { Router } from "express";
import {
  generateSavingsPlan,
  getPlan,
  getAllPlans,
  deletePlan,
} from "../controllers/plannerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/generate-plan", generateSavingsPlan);
router.get("/plans", getAllPlans);
router.get("/plans/:planId", getPlan);
router.delete("/plans/:planId", deletePlan);

export default router;
