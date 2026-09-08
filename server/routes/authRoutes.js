import { Router } from "express";
import { authLimiter, emailLimiter } from "../middleware/rateLimit.js";
import { requireOwner } from "../middleware/auth.js";
import { forgotPassword, getOwnerMe, loginOwner, registerOwner, resendPasswordResetCode, resendVerificationCode, resetPassword, verifyOwnerEmail, verifyPasswordResetCode } from "../controllers/authController.js";

const router = Router();
router.post("/register", authLimiter, emailLimiter, registerOwner);
router.post("/verify-email", authLimiter, verifyOwnerEmail);
router.post("/resend-verification", emailLimiter, resendVerificationCode);
router.post("/login", authLimiter, loginOwner);
router.get("/me", requireOwner, getOwnerMe);
router.post("/forgot-password", emailLimiter, forgotPassword);
router.post("/resend-reset-code", emailLimiter, resendPasswordResetCode);
router.post("/verify-reset-code", authLimiter, verifyPasswordResetCode);
router.post("/reset-password", authLimiter, resetPassword);
export default router;
