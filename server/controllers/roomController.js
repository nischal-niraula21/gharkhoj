import Room from "../models/Room.js";
import {
  deleteImage,
  uploadImage,
} from "../services/imageService.js";

const parseMaybeJson = (value, fallback) => {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const imageUrl = (image) =>
  typeof image === "string" ? image : image?.url || "";

const publicRoomShape = (room) => {
  const r = room.toObject ? room.toObject() : room;

  return {
    ...r,
    id: r._id?.toString?.() || r.id,
    images: (r.images || []).map(imageUrl),
  };
};

const publicRoomListShape = (room) => {
  const { _id, coverImage, ...rest } = room;

  return {
    ...rest,
    id: _id?.toString?.() || room.id,
    images: coverImage ? [coverImage] : [],
  };
};

export const listPublicRooms = async (req, res, next) => {
  try {
    const q = { status: "approved" };

    if (req.query.maxRent) {
      q.monthlyRent = { $lte: Number(req.query.maxRent) };
    }

    if (req.query.roomType) {
      q.roomType = req.query.roomType;
    }

    if (req.query.district) {
      q.district = new RegExp(req.query.district, "i");
    }

    if (req.query.province) {
      q.province = new RegExp(req.query.province, "i");
    }

    if (req.query.furnishedStatus) {
      q.furnishedStatus = req.query.furnishedStatus;
    }

    if (req.query.facilities) {
      q.facilities = {
        $all: String(req.query.facilities)
          .split(",")
          .filter(Boolean),
      };
    }

    if (req.query.location) {
      const escaped = String(req.query.location).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const rx = new RegExp(escaped, "i");

      q.$or = [
        { title: rx },
        { district: rx },
        { municipality: rx },
        { area: rx },
        { nearestLandmark: rx },
      ];
    }

    const sort =
      req.query.sort === "price_asc"
        ? { monthlyRent: 1 }
        : req.query.sort === "price_desc"
          ? { monthlyRent: -1 }
          : { createdAt: -1 };

    const rooms = await Room.find(q)
      .select(
        "title monthlyRent roomType numberOfRooms province district municipality area nearestLandmark furnishedStatus facilities coverImage createdAt",
      )
      .sort(sort)
      .limit(200)
      .lean();

    res.json({
      rooms: rooms.map(publicRoomListShape),
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "approved",
      },
      {
        $inc: { views: 1 },
      },
      {
        new: true,
      },
    ).populate(
      "owner",
      "fullName email phone emailVerified",
    );

    if (!room) {
      return res
        .status(404)
        .json({ message: "Room not found." });
    }

    res.json({
      room: publicRoomShape(room),
    });
  } catch (error) {
    next(error);
  }
};

export const listOwnerRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      owner: req.owner._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      rooms: rooms.map(publicRoomShape),
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 5) {
      return res.status(400).json({
        message: "Please upload at least 5 room photos.",
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        message:
          "A listing can contain a maximum of 10 photos.",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const images = [];

    for (const file of req.files) {
      images.push(await uploadImage(file, baseUrl));
    }

    const facilities = parseMaybeJson(
      req.body.facilities,
      [],
    );

    const charges = parseMaybeJson(
      req.body.charges,
      {},
    );

    const contact = {
      name: req.owner.fullName,
      phone: req.owner.phone,
      email: req.owner.email,
      showPhone:
        String(req.body.showPhone ?? "true") !== "false",
      preferredContact:
        req.body.preferredContact || "Phone",
    };

    const room = await Room.create({
      owner: req.owner._id,
      title: req.body.title,
      roomType: req.body.roomType,
      numberOfRooms: Number(req.body.numberOfRooms || 1),
      monthlyRent: Number(req.body.monthlyRent),
      securityDeposit: Number(
        req.body.securityDeposit || 0,
      ),
      province: req.body.province,
      district: req.body.district,
      municipality: req.body.municipality,
      ward: req.body.ward,
      area: req.body.area,
      street: req.body.street,
      fullAddress: req.body.fullAddress,
      nearestLandmark: req.body.nearestLandmark,
      landmarkDistance: req.body.landmarkDistance,
      floor: req.body.floor,
      furnishedStatus: req.body.furnishedStatus,
      preferredTenant: req.body.preferredTenant,
      facilities,
      charges,
      availableFrom: req.body.availableFrom || new Date(),
      images,
      coverImage: imageUrl(images[0]),
      contact,
      status:
        req.body.saveAsDraft === "true"
          ? "draft"
          : "pending",
    });

    res.status(201).json({
      message:
        room.status === "draft"
          ? "Listing saved as draft."
          : "Listing submitted for admin approval.",
      room: publicRoomShape(room),
    });
  } catch (error) {
    next(error);
  }
};

export const updateOwnerRoom = async (
  req,
  res,
  next,
) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      owner: req.owner._id,
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: "Listing not found." });
    }

    const fields = [
      "title",
      "roomType",
      "province",
      "district",
      "municipality",
      "ward",
      "area",
      "street",
      "fullAddress",
      "nearestLandmark",
      "landmarkDistance",
      "floor",
      "furnishedStatus",
      "preferredTenant",
      "availableFrom",
    ];

    fields.forEach((key) => {
      if (req.body[key] !== undefined) {
        room[key] = req.body[key];
      }
    });

    [
      "numberOfRooms",
      "monthlyRent",
      "securityDeposit",
    ].forEach((key) => {
      if (req.body[key] !== undefined) {
        room[key] = Number(req.body[key]);
      }
    });

    if (req.body.facilities !== undefined) {
      room.facilities = parseMaybeJson(
        req.body.facilities,
        room.facilities,
      );
    }

    if (req.body.charges !== undefined) {
      room.charges = parseMaybeJson(
        req.body.charges,
        room.charges,
      );
    }

    if (req.body.showPhone !== undefined) {
      room.contact.showPhone =
        String(req.body.showPhone) !== "false";
    }

    if (req.body.preferredContact) {
      room.contact.preferredContact =
        req.body.preferredContact;
    }

    const keepUrls = new Set(
      parseMaybeJson(
        req.body.existingImages,
        (room.images || []).map(imageUrl),
      ),
    );

    const keptImages = (room.images || []).filter((image) =>
      keepUrls.has(imageUrl(image)),
    );

    const removedImages = (room.images || []).filter(
      (image) => !keepUrls.has(imageUrl(image)),
    );

    const newFiles = req.files || [];
    const totalImages =
      keptImages.length + newFiles.length;

    if (totalImages < 5) {
      return res.status(400).json({
        message: "At least 5 room photos are required.",
      });
    }

    if (totalImages > 10) {
      return res.status(400).json({
        message:
          "A listing can contain a maximum of 10 photos.",
      });
    }

    const newImages = [];
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    for (const file of newFiles) {
      newImages.push(await uploadImage(file, baseUrl));
    }

    room.images = [...keptImages, ...newImages];
    room.coverImage = imageUrl(room.images[0]);

    if (req.body.saveAsDraft === "true") {
      room.status = "draft";
    } else if (
      ["approved", "rejected", "draft", "rented"].includes(
        room.status,
      )
    ) {
      room.status = "pending";
    }

    await room.save();

    await Promise.all(
      removedImages.map((image) => deleteImage(image)),
    );

    res.json({
      message:
        room.status === "draft"
          ? "Listing saved as draft."
          : "Listing updated and sent for review.",
      room: publicRoomShape(room),
    });
  } catch (error) {
    next(error);
  }
};

export const ownerSetListingStatus = async (
  req,
  res,
  next,
) => {
  try {
    if (
      !["rented", "draft", "pending"].includes(
        req.body.status,
      )
    ) {
      return res.status(400).json({
        message: "Invalid owner listing status.",
      });
    }

    const room = await Room.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.owner._id,
      },
      {
        status: req.body.status,
      },
      {
        new: true,
      },
    );

    if (!room) {
      return res
        .status(404)
        .json({ message: "Listing not found." });
    }

    res.json({
      message: "Listing status updated.",
      room: publicRoomShape(room),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOwnerRoom = async (
  req,
  res,
  next,
) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      owner: req.owner._id,
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: "Listing not found." });
    }

    await Promise.all(
      (room.images || []).map((image) =>
        deleteImage(image),
      ),
    );

    await room.deleteOne();

    res.json({
      message: "Listing deleted.",
    });
  } catch (error) {
    next(error);
  }
};

export const registerContactIntent = async (
  req,
  res,
  next,
) => {
  try {
    const room = await Room.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "approved",
      },
      {
        $inc: { contactRequests: 1 },
      },
      {
        new: true,
      },
    );

    if (!room) {
      return res
        .status(404)
        .json({ message: "Room not found." });
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};