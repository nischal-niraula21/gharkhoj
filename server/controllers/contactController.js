import ContactMessage from "../models/ContactMessage.js";
import Report from "../models/Report.js";
import Room from "../models/Room.js";

export const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: "Name, email and message are required." });
    await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json({ message: "Thanks! We'll get back to you within a day." });
  } catch (error) { next(error); }
};

export const reportListing = async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, status: "approved" });
    if (!room) return res.status(404).json({ message: "Listing not found." });
    if (!req.body.reason) return res.status(400).json({ message: "Please select or enter a report reason." });
    await Report.create({ room: room._id, reason: req.body.reason, details: req.body.details, reporterEmail: req.body.reporterEmail });
    res.status(201).json({ message: "Thank you. The listing has been reported for review." });
  } catch (error) { next(error); }
};
