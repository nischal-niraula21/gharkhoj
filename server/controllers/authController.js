import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Owner from "../models/Owner.js";
import { generateResetToken, generateSixDigitCode, hashValue, maskEmail } from "../utils/security.js";
import { sendPasswordResetCode, sendSignupVerificationCode } from "../services/emailService.js";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validPassword = (password) => typeof password === "string" && password.length >= 8;

const signOwnerToken = (owner) => jwt.sign({ sub: owner._id.toString(), role: "owner" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const prepareVerificationCode = (owner) => {
  const code = generateSixDigitCode();
  owner.emailVerificationCodeHash = hashValue(code);
  owner.emailVerificationCodeExpires = new Date(Date.now() + TEN_MINUTES);
  owner.emailVerificationAttempts = 0;
  owner.emailVerificationLastSent = new Date();
  return code;
};

export const registerOwner = async (req, res, next) => {
  try {
    const { fullName, email, phone, address, district, password, confirmPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!fullName || !phone || !address || !district || !validEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please complete all required owner details." });
    }
    if (!/^\+?\d{10,15}$/.test(String(phone).replace(/\s+/g, ""))) {
      return res.status(400).json({ message: "Please enter a valid phone number." });
    }
    if (!validPassword(password)) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

    let owner = await Owner.findOne({ email: normalizedEmail }).select("+password +emailVerificationCodeHash +emailVerificationCodeExpires +emailVerificationAttempts +emailVerificationLastSent");
    if (owner?.emailVerified) return res.status(409).json({ message: "An owner account already exists with this email." });
    if (owner?.emailVerificationLastSent && Date.now() - owner.emailVerificationLastSent.getTime() < ONE_MINUTE) {
      return res.status(429).json({ message: "Please wait 60 seconds before requesting another verification code." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    if (!owner) {
      owner = new Owner({ fullName, email: normalizedEmail, phone, address, district, password: passwordHash });
    } else {
      Object.assign(owner, { fullName, phone, address, district, password: passwordHash });
    }

    const code = prepareVerificationCode(owner);
    await owner.save();
    await sendSignupVerificationCode(owner.email, code);

    return res.status(201).json({ message: "A 6-digit verification code has been sent to your email.", email: owner.email, maskedEmail: maskEmail(owner.email) });
  } catch (error) { next(error); }
};

export const verifyOwnerEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "");
    const owner = await Owner.findOne({ email }).select("+emailVerificationCodeHash +emailVerificationCodeExpires +emailVerificationAttempts");
    if (!owner || owner.emailVerified) return res.status(400).json({ message: "Invalid or expired verification code." });
    if (!/^\d{6}$/.test(code) || !owner.emailVerificationCodeHash || !owner.emailVerificationCodeExpires || owner.emailVerificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }
    if ((owner.emailVerificationAttempts || 0) >= 5) return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." });
    if (hashValue(code) !== owner.emailVerificationCodeHash) {
      owner.emailVerificationAttempts = (owner.emailVerificationAttempts || 0) + 1;
      await owner.save();
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    owner.emailVerified = true;
    owner.emailVerificationCodeHash = undefined;
    owner.emailVerificationCodeExpires = undefined;
    owner.emailVerificationAttempts = 0;
    owner.emailVerificationLastSent = undefined;
    await owner.save();
    const token = signOwnerToken(owner);
    return res.json({ message: "Email verified successfully.", token, owner: owner.toSafeObject() });
  } catch (error) { next(error); }
};

export const resendVerificationCode = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const owner = await Owner.findOne({ email }).select("+emailVerificationLastSent +emailVerificationCodeHash +emailVerificationCodeExpires +emailVerificationAttempts");
    if (!owner || owner.emailVerified) return res.json({ message: "If verification is still required, a new code has been sent." });
    if (owner.emailVerificationLastSent && Date.now() - owner.emailVerificationLastSent.getTime() < ONE_MINUTE) {
      return res.status(429).json({ message: "Please wait 60 seconds before requesting another code." });
    }
    const code = prepareVerificationCode(owner);
    await owner.save();
    await sendSignupVerificationCode(owner.email, code);
    return res.json({ message: "A new verification code has been sent." });
  } catch (error) { next(error); }
};

export const loginOwner = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || "";
    const owner = await Owner.findOne({ email }).select("+password");
    if (!owner || !(await bcrypt.compare(password, owner.password))) return res.status(401).json({ message: "Invalid email or password." });
    if (!owner.emailVerified) return res.status(403).json({ message: "Please verify your email before signing in.", code: "EMAIL_NOT_VERIFIED", email: owner.email });
    if (owner.status !== "active") return res.status(403).json({ message: "This owner account is not currently active." });
    const token = signOwnerToken(owner);
    return res.json({ message: "Welcome back!", token, owner: owner.toSafeObject() });
  } catch (error) { next(error); }
};

export const getOwnerMe = async (req, res) => res.json({ owner: req.owner.toSafeObject() });

export const forgotPassword = async (req, res, next) => {
  const generic = { message: "If an owner account exists with this email, a verification code has been sent." };
  try {
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) return res.json(generic);
    const owner = await Owner.findOne({ email }).select("+passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetLastSent +passwordResetTokenHash +passwordResetTokenExpires");
    if (!owner) return res.json(generic);
    if (owner.passwordResetLastSent && Date.now() - owner.passwordResetLastSent.getTime() < ONE_MINUTE) return res.json(generic);

    const code = generateSixDigitCode();
    owner.passwordResetCodeHash = hashValue(code);
    owner.passwordResetCodeExpires = new Date(Date.now() + TEN_MINUTES);
    owner.passwordResetAttempts = 0;
    owner.passwordResetLastSent = new Date();
    owner.passwordResetTokenHash = undefined;
    owner.passwordResetTokenExpires = undefined;
    await owner.save();
    try { await sendPasswordResetCode(owner.email, code); }
    catch (mailError) { console.error("Password reset email delivery failed:", mailError.message); }
    return res.json(generic);
  } catch (error) { next(error); }
};

export const resendPasswordResetCode = async (req, res, next) => {
  const generic = { message: "If an owner account exists with this email, a new verification code has been sent." };
  try {
    const email = normalizeEmail(req.body.email);
    const owner = await Owner.findOne({ email }).select("+passwordResetLastSent +passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetTokenHash +passwordResetTokenExpires");
    if (!owner) return res.json(generic);
    if (owner.passwordResetLastSent && Date.now() - owner.passwordResetLastSent.getTime() < ONE_MINUTE) {
      return res.status(429).json({ message: "Please wait 60 seconds before requesting another code." });
    }
    const code = generateSixDigitCode();
    owner.passwordResetCodeHash = hashValue(code);
    owner.passwordResetCodeExpires = new Date(Date.now() + TEN_MINUTES);
    owner.passwordResetAttempts = 0;
    owner.passwordResetLastSent = new Date();
    owner.passwordResetTokenHash = undefined;
    owner.passwordResetTokenExpires = undefined;
    await owner.save();
    try { await sendPasswordResetCode(owner.email, code); }
    catch (mailError) { console.error("Password reset resend delivery failed:", mailError.message); }
    return res.json(generic);
  } catch (error) { next(error); }
};

export const verifyPasswordResetCode = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "");
    const owner = await Owner.findOne({ email }).select("+passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetTokenHash +passwordResetTokenExpires");
    if (!owner || !/^\d{6}$/.test(code) || !owner.passwordResetCodeHash || !owner.passwordResetCodeExpires || owner.passwordResetCodeExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }
    if ((owner.passwordResetAttempts || 0) >= 5) return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." });
    if (hashValue(code) !== owner.passwordResetCodeHash) {
      owner.passwordResetAttempts = (owner.passwordResetAttempts || 0) + 1;
      await owner.save();
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const resetToken = generateResetToken();
    owner.passwordResetTokenHash = hashValue(resetToken);
    owner.passwordResetTokenExpires = new Date(Date.now() + TEN_MINUTES);
    owner.passwordResetCodeHash = undefined;
    owner.passwordResetCodeExpires = undefined;
    owner.passwordResetAttempts = 0;
    await owner.save();
    return res.json({ message: "Email verified successfully.", resetToken });
  } catch (error) { next(error); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!validPassword(newPassword)) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });
    const owner = await Owner.findOne({ email }).select("+password +passwordResetTokenHash +passwordResetTokenExpires +passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetLastSent");
    if (!owner || !resetToken || !owner.passwordResetTokenHash || !owner.passwordResetTokenExpires || owner.passwordResetTokenExpires < new Date() || hashValue(resetToken) !== owner.passwordResetTokenHash) {
      return res.status(400).json({ message: "Invalid or expired password reset session." });
    }
    owner.password = await bcrypt.hash(newPassword, 12);
    owner.passwordResetTokenHash = undefined;
    owner.passwordResetTokenExpires = undefined;
    owner.passwordResetCodeHash = undefined;
    owner.passwordResetCodeExpires = undefined;
    owner.passwordResetAttempts = 0;
    owner.passwordResetLastSent = undefined;
    await owner.save();
    return res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) { next(error); }
};
