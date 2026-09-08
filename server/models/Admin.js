import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "admin" },
    passwordResetCodeHash: { type: String, select: false },
    passwordResetCodeExpires: { type: Date, select: false },
    passwordResetAttempts: { type: Number, default: 0, select: false },
    passwordResetLastSent: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
