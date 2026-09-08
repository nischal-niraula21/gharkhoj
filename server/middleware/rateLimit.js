import rateLimit from "express-rate-limit";

const jsonHandler = (_req, res) => res.status(429).json({ message: "Too many requests. Please try again later." });

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, handler: jsonHandler });
export const emailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: jsonHandler });
export const publicWriteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, handler: jsonHandler });
