import jwt from "jsonwebtoken";
import Owner from "../models/Owner.js";
import Admin from "../models/Admin.js";

const getBearer = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};

export const requireOwner = async (req, res, next) => {
  try {
    const token = getBearer(req);
    if (!token) return res.status(401).json({ message: "Authentication required." });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "owner") return res.status(403).json({ message: "Owner access required." });
    const owner = await Owner.findById(payload.sub);
    if (!owner || owner.status !== "active") return res.status(401).json({ message: "Owner account is unavailable." });
    req.owner = owner;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const token = getBearer(req);
    if (!token) return res.status(401).json({ message: "Authentication required." });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ message: "Admin access required." });
    const admin = await Admin.findById(payload.sub);
    if (!admin) return res.status(401).json({ message: "Admin account not found." });
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin session." });
  }
};
