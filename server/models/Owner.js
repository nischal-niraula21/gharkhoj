import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended", "blocked"], default: "active" },

    emailVerificationCodeHash: { type: String, select: false },
    emailVerificationCodeExpires: { type: Date, select: false },
    emailVerificationAttempts: { type: Number, default: 0, select: false },
    emailVerificationLastSent: { type: Date, select: false },

    passwordResetCodeHash: { type: String, select: false },
    passwordResetCodeExpires: { type: Date, select: false },
    passwordResetAttempts: { type: Number, default: 0, select: false },
    passwordResetLastSent: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

ownerSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    address: this.address,
    district: this.district,
    emailVerified: this.emailVerified,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("Owner", ownerSchema);
