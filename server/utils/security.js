import crypto from "crypto";

export const generateSixDigitCode = () => crypto.randomInt(100000, 1000000).toString();
export const hashValue = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
export const generateResetToken = () => crypto.randomBytes(32).toString("hex");

export const maskEmail = (email = "") => {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, name.length - 2))}@${domain}`;
};
