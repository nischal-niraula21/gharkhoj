import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, default: "" } },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
    title: { type: String, required: true, trim: true },
    roomType: {
      type: String,
      enum: ["Single Room", "Double Room", "Flat", "Apartment", "Hostel Room", "House"],
      required: true,
    },
    numberOfRooms: { type: Number, min: 1, default: 1 },
    monthlyRent: { type: Number, min: 0, required: true },
    securityDeposit: { type: Number, min: 0, default: 0 },
    province: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    municipality: { type: String, required: true, trim: true },
    ward: { type: String, trim: true },
    area: { type: String, required: true, trim: true },
    street: { type: String, trim: true },
    fullAddress: { type: String, trim: true },
    nearestLandmark: { type: String, required: true, trim: true },
    landmarkDistance: { type: String, required: true, trim: true },
    floor: { type: String, trim: true },
    furnishedStatus: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      default: "Unfurnished",
    },
    preferredTenant: {
      type: String,
      enum: ["Student", "Family", "Working Professional", "Anyone"],
      default: "Anyone",
    },
    facilities: [{ type: String, trim: true }],
    charges: {
      electricity: { type: String, enum: ["Included", "Separate"], default: "Separate" },
      water: { type: String, enum: ["Included", "Separate"], default: "Included" },
      internet: { type: String, enum: ["Included", "Separate"], default: "Separate" },
    },
    availableFrom: { type: Date, default: Date.now },
    images: { type: [imageSchema], validate: [(v) => v.length >= 5, "At least 5 room photos are required"] },
    coverImage: { type: String, required: true },
    contact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      showPhone: { type: Boolean, default: true },
      preferredContact: { type: String, enum: ["Phone", "WhatsApp", "Email"], default: "Phone" },
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "rented", "suspended"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
    views: { type: Number, default: 0 },
    contactRequests: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roomSchema.index({ title: "text", area: "text", municipality: "text", district: "text", nearestLandmark: "text" });

export default mongoose.model("Room", roomSchema);
