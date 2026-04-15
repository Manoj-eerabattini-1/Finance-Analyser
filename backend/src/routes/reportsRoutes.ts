import { Router } from "express";
import {
  getMonthlyReport,
  getSpendingCategoriesReport,
  getSavingsProgressReport,
  getFinancialSummary,
  generateReportInsights,
  saveReport,
  getSavedReports,
  deleteSavedReport,
} from "../controllers/reportsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/monthly", getMonthlyReport);
router.get("/spending-categories", getSpendingCategoriesReport);
router.get("/savings-progress", getSavingsProgressReport);
router.get("/summary", getFinancialSummary);
router.get("/insights", generateReportInsights);
router.post("/", saveReport);
router.get("/", getSavedReports);
router.delete("/:id", deleteSavedReport);

export default router;
