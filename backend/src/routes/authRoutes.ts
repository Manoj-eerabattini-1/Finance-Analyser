import { Router } from "express";
import { register, login, getProfile, getCurrency, setCurrency } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/profile", authMiddleware, getProfile);

// Currency preference endpoints
router.get("/currency", authMiddleware, getCurrency);
router.put("/currency", authMiddleware, setCurrency);

export default router;
