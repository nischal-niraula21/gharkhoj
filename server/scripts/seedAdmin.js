import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running npm run seed:admin");
  process.exit(1);
}
await connectDB();
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
const admin = await Admin.findOneAndUpdate(
  { email },
  { name: process.env.ADMIN_NAME || "GharKhoj Admin", email, password },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);
console.log(`Admin ready: ${admin.email}`);
process.exit(0);
