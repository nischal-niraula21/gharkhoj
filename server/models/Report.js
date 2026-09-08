import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    reason: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    reporterEmail: { type: String, trim: true, lowercase: true },
    status: { type: String, enum: ["new", "reviewed", "dismissed"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
