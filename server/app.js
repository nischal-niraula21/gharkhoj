import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const allowedOrigins = String(process.env.FRONTEND_URL || "http://localhost:8080")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(cors({ origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("CORS origin not allowed"))) }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(path.resolve("server/uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "GharKhoj API" }));
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

app.use((err, _req, res, _next) => {
  console.error(err?.message || err);
  if (err?.name === "MulterError") return res.status(400).json({ message: err.message });
  if (err?.name === "ValidationError") return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(" ") });
  if (err?.code === 11000) return res.status(409).json({ message: "A record with that value already exists." });
  res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Something went wrong." : err?.message || "Server error" });
});

export default app;
