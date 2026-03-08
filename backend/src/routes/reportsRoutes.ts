import { Router } from "express";
import {
  getMonthlyReport,
  getSpendingCategoriesReport,
  getSavingsProgressReport,
  getFinancialSummary,
} from "../controllers/reportsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/monthly", getMonthlyReport);
router.get("/spending-categories", getSpendingCategoriesReport);
router.get("/savings-progress", getSavingsProgressReport);
router.get("/summary", getFinancialSummary);

export default router;
