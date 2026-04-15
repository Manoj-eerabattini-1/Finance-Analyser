import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  deleteTransaction,
  extractTransactions,
  createMultipleTransactions,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createTransactionSchema } from "../validators/transactionValidator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validateRequest(createTransactionSchema), createTransaction);
router.post("/batch", createMultipleTransactions);
router.post("/extract", extractTransactions);
router.get("/", getTransactions);
router.get("/summary", getTransactionSummary);
router.delete("/:id", deleteTransaction);

export default router;
