import { Router } from "express";

import { requireAdmin } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

import {
    adminForgotPassword,
    adminLogin,
    adminMe,
    adminResendResetCode,
    adminResetPassword,
    adminVerifyResetCode,
    dashboardStats,
    deleteMessage,
    deleteRoomAdmin,
    listMessages,
    listOwners,
    listReports,
    listRoomsAdmin,
    updateMessage,
    updateOwnerStatus,
    updateReport,
    updateRoomAdmin,
} from "../controllers/adminController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

router.post(
    "/login",
    authLimiter,
    adminLogin,
);

router.post(
    "/forgot-password",
    authLimiter,
    adminForgotPassword,
);

router.post(
    "/resend-reset-code",
    authLimiter,
    adminResendResetCode,
);

router.post(
    "/verify-reset-code",
    authLimiter,
    adminVerifyResetCode,
);

router.post(
    "/reset-password",
    authLimiter,
    adminResetPassword,
);

/*
|--------------------------------------------------------------------------
| Current Admin
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    requireAdmin,
    adminMe,
);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
    "/stats",
    requireAdmin,
    dashboardStats,
);

/*
|--------------------------------------------------------------------------
| Listings
|--------------------------------------------------------------------------
*/

router.get(
    "/rooms",
    requireAdmin,
    listRoomsAdmin,
);

router.patch(
    "/rooms/:id",
    requireAdmin,
    updateRoomAdmin,
);

router.delete(
    "/rooms/:id",
    requireAdmin,
    deleteRoomAdmin,
);

/*
|--------------------------------------------------------------------------
| Property Owners
|--------------------------------------------------------------------------
*/

router.get(
    "/owners",
    requireAdmin,
    listOwners,
);

router.patch(
    "/owners/:id/status",
    requireAdmin,
    updateOwnerStatus,
);

/*
|--------------------------------------------------------------------------
| Contact Messages
|--------------------------------------------------------------------------
*/

router.get(
    "/messages",
    requireAdmin,
    listMessages,
);

router.patch(
    "/messages/:id",
    requireAdmin,
    updateMessage,
);

router.delete(
    "/messages/:id",
    requireAdmin,
    deleteMessage,
);

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
*/

router.get(
    "/reports",
    requireAdmin,
    listReports,
);

router.patch(
    "/reports/:id",
    requireAdmin,
    updateReport,
);

export default router;
