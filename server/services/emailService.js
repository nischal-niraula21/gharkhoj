import { Resend } from "resend";

const client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendCodeEmail = async ({ to, code, purpose }) => {
  if (!client || !process.env.RESEND_FROM_EMAIL) {
    throw new Error("Email service is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const isAdminReset = purpose === "admin-password-reset";
  const isReset = purpose === "password-reset" || isAdminReset;
  const subject = isReset ? "GharKhoj Password Reset Verification Code" : "Verify your GharKhoj owner account";
  const heading = isReset ? "Password Reset Verification" : "Verify Your Email";
  const intro = isAdminReset
    ? "We received a request to reset the password for the private GharKhoj administrator account."
    : isReset
      ? "We received a request to reset the password for your GharKhoj property owner account."
      : "Use this code to verify your property owner account and finish your GharKhoj registration.";

  const { error } = await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7f7;padding:32px;color:#173632">
        <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #e6ecea">
          <div style="font-size:24px;font-weight:800;margin-bottom:24px">Ghar<span style="color:#16a085">Khoj</span></div>
          <h2 style="margin:0 0 12px;font-size:22px">${heading}</h2>
          <p style="line-height:1.6;color:#5f6f6c">${intro}</p>
          <p style="margin:28px 0 8px;color:#5f6f6c">Your verification code is:</p>
          <div style="letter-spacing:10px;font-size:38px;font-weight:800;text-align:center;background:#eff8f5;border-radius:14px;padding:18px;color:#116a5b">${code}</div>
          <p style="margin-top:20px;line-height:1.6;color:#5f6f6c">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top:28px;color:#5f6f6c">GharKhoj Team</p>
        </div>
      </div>`,
  });

  if (error) throw new Error(error.message || "Unable to send verification email");
};

export const sendSignupVerificationCode = (to, code) => sendCodeEmail({ to, code, purpose: "signup" });
export const sendPasswordResetCode = (to, code) => sendCodeEmail({ to, code, purpose: "password-reset" });
export const sendAdminPasswordResetCode = (to, code) => sendCodeEmail({ to, code, purpose: "admin-password-reset" });
