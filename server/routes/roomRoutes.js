import { Router } from "express";
import { requireOwner } from "../middleware/auth.js";
import { roomUpload } from "../middleware/upload.js";
import { publicWriteLimiter } from "../middleware/rateLimit.js";
import { createRoom, deleteOwnerRoom, getPublicRoom, listOwnerRooms, listPublicRooms, ownerSetListingStatus, registerContactIntent, updateOwnerRoom } from "../controllers/roomController.js";

const router = Router();
router.get("/", listPublicRooms);
router.get("/owner/mine", requireOwner, listOwnerRooms);
router.post("/", requireOwner, roomUpload.array("images", 10), createRoom);
router.patch("/:id", requireOwner, roomUpload.array("images", 10), updateOwnerRoom);
router.patch("/:id/status", requireOwner, ownerSetListingStatus);
router.delete("/:id", requireOwner, deleteOwnerRoom);
router.post("/:id/contact", publicWriteLimiter, registerContactIntent);
router.get("/:id", getPublicRoom);
export default router;
