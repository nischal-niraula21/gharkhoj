import { Router } from "express";
import { createContactMessage, reportListing } from "../controllers/contactController.js";
import { publicWriteLimiter } from "../middleware/rateLimit.js";
const router = Router();
router.post("/", publicWriteLimiter, createContactMessage);
router.post("/report/:id", publicWriteLimiter, reportListing);
export default router;
