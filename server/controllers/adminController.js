import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import Owner from "../models/Owner.js";
import Room from "../models/Room.js";
import ContactMessage from "../models/ContactMessage.js";
import Report from "../models/Report.js";

import { deleteImage } from "../services/imageService.js";

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

export const adminLogin = async (
  req,
  res,
  next,
) => {
  try {
    const email = String(
      req.body.email || "",
    )
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email,
    }).select("+password");

    if (
      !admin ||
      !(await bcrypt.compare(
        req.body.password || "",
        admin.password,
      ))
    ) {
      return res.status(401).json({
        message:
          "Invalid admin email or password.",
      });
    }

    const token = jwt.sign(
      {
        sub: admin._id.toString(),
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    return res.json({
      token,

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminMe = async (
  req,
  res,
) => {
  res.json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: "admin",
    },
  });
};

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export const dashboardStats = async (
  _req,
  res,
  next,
) => {
  try {
    const [
      totalListings,
      activeListings,
      pendingApproval,
      registeredOwners,
      reportedListings,
      viewAgg,
    ] = await Promise.all([
      Room.countDocuments(),

      Room.countDocuments({
        status: "approved",
      }),

      Room.countDocuments({
        status: "pending",
      }),

      Owner.countDocuments(),

      Report.countDocuments({
        status: "new",
      }),

      Room.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$views",
            },
          },
        },
      ]),
    ]);

    res.json({
      totalListings,
      activeListings,
      pendingApproval,
      registeredOwners,
      reportedListings,

      totalListingViews:
        viewAgg[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Listings
|--------------------------------------------------------------------------
*/

export const listRoomsAdmin = async (
  req,
  res,
  next,
) => {
  try {
    const filter =
      req.query.status &&
        req.query.status !== "all"
        ? {
          status: req.query.status,
        }
        : {};

    const rooms = await Room.find(
      filter,
    )
      .populate(
        "owner",
        "fullName email phone status",
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoomAdmin = async (
  req,
  res,
  next,
) => {
  try {
    const allowed = [
      "approved",
      "rejected",
      "suspended",
      "pending",
    ];

    if (
      !allowed.includes(
        req.body.status,
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid listing status.",
      });
    }

    const room =
      await Room.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,

          rejectionReason:
            req.body.rejectionReason ||
            "",
        },
        {
          new: true,
        },
      );

    if (!room) {
      return res.status(404).json({
        message:
          "Listing not found.",
      });
    }

    res.json({
      message: `Listing ${req.body.status}.`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomAdmin = async (
  req,
  res,
  next,
) => {
  try {
    const room = await Room.findById(
      req.params.id,
    );

    if (!room) {
      return res.status(404).json({
        message:
          "Listing not found.",
      });
    }

    await Promise.all(
      (room.images || []).map(
        deleteImage,
      ),
    );

    await room.deleteOne();

    res.json({
      message:
        "Listing deleted.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Property Owners
|--------------------------------------------------------------------------
*/

export const listOwners = async (
  _req,
  res,
  next,
) => {
  try {
    const owners =
      await Owner.aggregate([
        {
          $lookup: {
            from: "rooms",
            localField: "_id",
            foreignField: "owner",
            as: "listings",
          },
        },

        {
          $project: {
            fullName: 1,
            email: 1,
            phone: 1,
            district: 1,
            status: 1,
            emailVerified: 1,
            createdAt: 1,

            listingCount: {
              $size: "$listings",
            },

            activeListings: {
              $size: {
                $filter: {
                  input:
                    "$listings",

                  as: "r",

                  cond: {
                    $eq: [
                      "$$r.status",
                      "approved",
                    ],
                  },
                },
              },
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

    res.json({
      owners,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOwnerStatus =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const allowed = [
        "active",
        "suspended",
        "blocked",
      ];

      if (
        !allowed.includes(
          req.body.status,
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid owner status.",
          });
      }

      const owner =
        await Owner.findByIdAndUpdate(
          req.params.id,
          {
            status:
              req.body.status,
          },
          {
            new: true,
          },
        );

      if (!owner) {
        return res
          .status(404)
          .json({
            message:
              "Owner not found.",
          });
      }

      res.json({
        message:
          "Owner status updated.",
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Contact Messages
|--------------------------------------------------------------------------
*/

export const listMessages = async (
  _req,
  res,
  next,
) => {
  try {
    const messages =
      await ContactMessage.find().sort(
        {
          createdAt: -1,
        },
      );

    res.json({
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (
  req,
  res,
  next,
) => {
  try {
    const allowed = [
      "new",
      "read",
      "resolved",
    ];

    if (
      !allowed.includes(
        req.body.status,
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid message status.",
      });
    }

    const message =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          status:
            req.body.status,
        },
        {
          new: true,
        },
      );

    if (!message) {
      return res.status(404).json({
        message:
          "Message not found.",
      });
    }

    res.json({
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req,
  res,
  next,
) => {
  try {
    const message =
      await ContactMessage.findByIdAndDelete(
        req.params.id,
      );

    if (!message) {
      return res.status(404).json({
        message:
          "Message not found.",
      });
    }

    res.json({
      message:
        "Message deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
*/

export const listReports = async (
  _req,
  res,
  next,
) => {
  try {
    const reports =
      await Report.find()
        .populate({
          path: "room",

          select:
            "title district municipality status",

          populate: {
            path: "owner",
            select:
              "fullName email",
          },
        })
        .sort({
          createdAt: -1,
        });

    res.json({
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (
  req,
  res,
  next,
) => {
  try {
    const allowed = [
      "new",
      "reviewed",
      "dismissed",
    ];

    if (
      !allowed.includes(
        req.body.status,
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid report status.",
      });
    }

    const report =
      await Report.findByIdAndUpdate(
        req.params.id,
        {
          status:
            req.body.status,
        },
        {
          new: true,
        },
      );

    if (!report) {
      return res.status(404).json({
        message:
          "Report not found.",
      });
    }

    res.json({
      report,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Admin Forgot Password
|--------------------------------------------------------------------------
*/

export const adminForgotPassword =
  async (
    req,
    res,
    next,
  ) => {
    const generic = {
      message:
        "If an admin account exists with this email, a verification code has been sent.",
    };

    try {
      const email = String(
        req.body.email || "",
      )
        .trim()
        .toLowerCase();

      const admin =
        await Admin.findOne({
          email,
        }).select(
          "+passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetLastSent +passwordResetTokenHash +passwordResetTokenExpires",
        );

      if (!admin) {
        return res.json(
          generic,
        );
      }

      if (
        admin.passwordResetLastSent &&
        Date.now() -
        admin.passwordResetLastSent.getTime() <
        60_000
      ) {
        return res.json(
          generic,
        );
      }

      const {
        generateSixDigitCode,
        hashValue,
      } = await import(
        "../utils/security.js"
      );

      const {
        sendAdminPasswordResetCode,
      } = await import(
        "../services/emailService.js"
      );

      const code =
        generateSixDigitCode();

      admin.passwordResetCodeHash =
        hashValue(code);

      admin.passwordResetCodeExpires =
        new Date(
          Date.now() +
          10 * 60_000,
        );

      admin.passwordResetAttempts = 0;

      admin.passwordResetLastSent =
        new Date();

      admin.passwordResetTokenHash =
        undefined;

      admin.passwordResetTokenExpires =
        undefined;

      await admin.save();

      try {
        await sendAdminPasswordResetCode(
          admin.email,
          code,
        );
      } catch (mailError) {
        console.error(
          "Admin password reset email delivery failed:",
          mailError.message,
        );
      }

      res.json(generic);
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Resend Admin Reset Code
|--------------------------------------------------------------------------
*/

export const adminResendResetCode =
  async (
    req,
    res,
    next,
  ) => {
    const generic = {
      message:
        "If an admin account exists with this email, a new verification code has been sent.",
    };

    try {
      const email = String(
        req.body.email || "",
      )
        .trim()
        .toLowerCase();

      const admin =
        await Admin.findOne({
          email,
        }).select(
          "+passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetLastSent +passwordResetTokenHash +passwordResetTokenExpires",
        );

      if (!admin) {
        return res.json(
          generic,
        );
      }

      if (
        admin.passwordResetLastSent &&
        Date.now() -
        admin.passwordResetLastSent.getTime() <
        60_000
      ) {
        return res
          .status(429)
          .json({
            message:
              "Please wait 60 seconds before requesting another code.",
          });
      }

      const {
        generateSixDigitCode,
        hashValue,
      } = await import(
        "../utils/security.js"
      );

      const {
        sendAdminPasswordResetCode,
      } = await import(
        "../services/emailService.js"
      );

      const code =
        generateSixDigitCode();

      admin.passwordResetCodeHash =
        hashValue(code);

      admin.passwordResetCodeExpires =
        new Date(
          Date.now() +
          10 * 60_000,
        );

      admin.passwordResetAttempts = 0;

      admin.passwordResetLastSent =
        new Date();

      admin.passwordResetTokenHash =
        undefined;

      admin.passwordResetTokenExpires =
        undefined;

      await admin.save();

      try {
        await sendAdminPasswordResetCode(
          admin.email,
          code,
        );
      } catch (mailError) {
        console.error(
          "Admin password reset resend delivery failed:",
          mailError.message,
        );
      }

      res.json(generic);
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Verify Admin Reset Code
|--------------------------------------------------------------------------
*/

export const adminVerifyResetCode =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const email = String(
        req.body.email || "",
      )
        .trim()
        .toLowerCase();

      const code = String(
        req.body.code || "",
      );

      const admin =
        await Admin.findOne({
          email,
        }).select(
          "+passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetTokenHash +passwordResetTokenExpires",
        );

      const {
        generateResetToken,
        hashValue,
      } = await import(
        "../utils/security.js"
      );

      if (
        !admin ||
        !/^\d{6}$/.test(code) ||
        !admin.passwordResetCodeHash ||
        !admin.passwordResetCodeExpires ||
        admin.passwordResetCodeExpires <
        new Date()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid or expired verification code.",
          });
      }

      if (
        (admin.passwordResetAttempts ||
          0) >= 5
      ) {
        return res
          .status(429)
          .json({
            message:
              "Too many incorrect attempts. Request a new code.",
          });
      }

      if (
        hashValue(code) !==
        admin.passwordResetCodeHash
      ) {
        admin.passwordResetAttempts =
          (admin.passwordResetAttempts ||
            0) + 1;

        await admin.save();

        return res
          .status(400)
          .json({
            message:
              "Invalid or expired verification code.",
          });
      }

      const resetToken =
        generateResetToken();

      admin.passwordResetTokenHash =
        hashValue(resetToken);

      admin.passwordResetTokenExpires =
        new Date(
          Date.now() +
          10 * 60_000,
        );

      admin.passwordResetCodeHash =
        undefined;

      admin.passwordResetCodeExpires =
        undefined;

      admin.passwordResetAttempts = 0;

      await admin.save();

      res.json({
        message:
          "Email verified successfully.",

        resetToken,
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Reset Admin Password
|--------------------------------------------------------------------------
*/

export const adminResetPassword =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const email = String(
        req.body.email || "",
      )
        .trim()
        .toLowerCase();

      const {
        resetToken,
        newPassword,
        confirmPassword,
      } = req.body;

      if (
        !newPassword ||
        newPassword.length < 8
      ) {
        return res
          .status(400)
          .json({
            message:
              "Password must be at least 8 characters.",
          });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "Passwords do not match.",
          });
      }

      const admin =
        await Admin.findOne({
          email,
        }).select(
          "+password +passwordResetTokenHash +passwordResetTokenExpires +passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts +passwordResetLastSent",
        );

      const {
        hashValue,
      } = await import(
        "../utils/security.js"
      );

      if (
        !admin ||
        !resetToken ||
        !admin.passwordResetTokenHash ||
        !admin.passwordResetTokenExpires ||
        admin.passwordResetTokenExpires <
        new Date() ||
        hashValue(resetToken) !==
        admin.passwordResetTokenHash
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid or expired password reset session.",
          });
      }

      admin.password =
        await bcrypt.hash(
          newPassword,
          12,
        );

      admin.passwordResetTokenHash =
        undefined;

      admin.passwordResetTokenExpires =
        undefined;

      admin.passwordResetCodeHash =
        undefined;

      admin.passwordResetCodeExpires =
        undefined;

      admin.passwordResetAttempts = 0;

      admin.passwordResetLastSent =
        undefined;

      await admin.save();

      res.json({
        message:
          "Admin password reset successfully.",
      });
    } catch (error) {
      next(error);
    }
  };