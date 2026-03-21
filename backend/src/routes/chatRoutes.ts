import { Router } from "express";
import { chat, getChatHistory } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getChatHistory);
router.post("/", chat);

export default router;