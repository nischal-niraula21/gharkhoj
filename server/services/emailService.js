import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const logoUrl =
  process.env.EMAIL_LOGO_URL ||
  "https://res.cloudinary.com/i0lqoyaw/image/upload/v1788887321/gharkhoj-logo-icon.png";

const renderOtp = (code) => {
  const digits = String(code).padStart(6, "0").slice(0, 6).split("");

  return `
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      align="center"
      style="
        margin: 0 auto;
        border-collapse: separate;
      "
    >
      <tr>
        ${digits
      .map(
        (digit, index) => `
              <td
                style="
                  width: 44px;
                  height: 58px;
                  text-align: center;
                  vertical-align: middle;
                  background: #eff8f5;
                  border: 1px solid #dcefe9;
                  border-radius: 12px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 34px;
                  line-height: 58px;
                  font-weight: 800;
                  color: #116a5b;
                  white-space: nowrap;
                "
              >
                ${digit}
              </td>

              ${index < digits.length - 1
            ? `
                    <td
                      style="
                        width: 6px;
                        font-size: 1px;
                        line-height: 1px;
                      "
                    >
                      &nbsp;
                    </td>
                  `
            : ""
          }
            `,
      )
      .join("")}
      </tr>
    </table>
  `;
};

const sendCodeEmail = async ({ to, code, purpose }) => {
  if (!resend) {
    throw new Error(
      "Email service is not configured. RESEND_API_KEY is missing.",
    );
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error(
      "Email service is not configured. RESEND_FROM_EMAIL is missing.",
    );
  }

  const isAdminReset = purpose === "admin-password-reset";

  const isPasswordReset =
    purpose === "password-reset" || isAdminReset;

  const subject = isAdminReset
    ? "GharKhoj Admin Password Reset Code"
    : isPasswordReset
      ? "GharKhoj Password Reset Verification Code"
      : "Verify Your GharKhoj Owner Account";

  const heading = isAdminReset
    ? "Admin Password Reset"
    : isPasswordReset
      ? "Password Reset Verification"
      : "Verify Your Email";

  const intro = isAdminReset
    ? "We received a request to reset the password for the private GharKhoj administrator account."
    : isPasswordReset
      ? "We received a request to reset the password for your GharKhoj property owner account."
      : "Use this verification code to confirm your email address and finish creating your GharKhoj property owner account.";

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,

    html: `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f5f7f7;
            font-family: Arial, Helvetica, sans-serif;
            color: #173632;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width: 100%;
              margin: 0;
              padding: 0;
              background: #f5f7f7;
            "
          >
            <tr>
              <td
                align="center"
                style="
                  padding: 28px 14px;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    width: 100%;
                    max-width: 560px;
                    background: #ffffff;
                    border: 1px solid #e6ecea;
                    border-radius: 20px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding: 32px 26px;
                      "
                    >

                      <!-- GharKhoj logo and name -->
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                          margin: 0 0 28px 0;
                        "
                      >
                        <tr>
                          <td
                            style="
                              vertical-align: middle;
                              padding-right: 11px;
                            "
                          >
                            <img
                              src="${logoUrl}"
                              alt="GharKhoj"
                              width="42"
                              height="42"
                              style="
                                display: block;
                                width: 42px;
                                height: 42px;
                                border: 0;
                                border-radius: 50%;
                                object-fit: contain;
                              "
                            />
                          </td>

                          <td
                            style="
                              vertical-align: middle;
                              font-family: Arial, Helvetica, sans-serif;
                              font-size: 25px;
                              line-height: 1;
                              font-weight: 800;
                              color: #173632;
                              white-space: nowrap;
                            "
                          >
                            Ghar<span style="color: #16a085;">Khoj</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Heading -->
                      <h1
                        style="
                          margin: 0 0 14px 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 28px;
                          line-height: 1.2;
                          font-weight: 800;
                          color: #173632;
                        "
                      >
                        ${heading}
                      </h1>

                      <!-- Description -->
                      <p
                        style="
                          margin: 0 0 26px 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 16px;
                          line-height: 1.7;
                          color: #5f6f6c;
                        "
                      >
                        ${intro}
                      </p>

                      <!-- Code label -->
                      <p
                        style="
                          margin: 0 0 14px 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 16px;
                          line-height: 1.6;
                          color: #5f6f6c;
                        "
                      >
                        Your verification code is:
                      </p>

                      <!-- OTP code -->
                      <div
                        style="
                          margin: 0 0 26px 0;
                          text-align: center;
                        "
                      >
                        ${renderOtp(code)}
                      </div>

                      <!-- Expiry -->
                      <p
                        style="
                          margin: 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 15px;
                          line-height: 1.7;
                          color: #5f6f6c;
                        "
                      >
                        This code expires in
                        <strong style="color: #173632;">
                          10 minutes
                        </strong>.
                        <br />

                        If you did not request this,
                        you can safely ignore this email.
                      </p>

                      <!-- Divider -->
                      <div
                        style="
                          height: 1px;
                          background: #e6ecea;
                          margin: 28px 0 20px 0;
                        "
                      ></div>

                      <!-- Footer -->
                      <p
                        style="
                          margin: 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #879693;
                        "
                      >
                        This is an automated email from GharKhoj.
                        Please do not reply to this message.
                      </p>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(
      error.message || "Unable to send verification email.",
    );
  }
};

export const sendSignupVerificationCode = (to, code) =>
  sendCodeEmail({
    to,
    code,
    purpose: "signup",
  });

export const sendPasswordResetCode = (to, code) =>
  sendCodeEmail({
    to,
    code,
    purpose: "password-reset",
  });

export const sendAdminPasswordResetCode = (to, code) =>
  sendCodeEmail({
    to,
    code,
    purpose: "admin-password-reset",
  });