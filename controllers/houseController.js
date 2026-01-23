const House = require("../models/House");
console.log("House model loaded:", !!House);


exports.createHouse = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "owner") {
      return res.status(403).json({ message: "Only owners can create houses" });
    }

    const house = await House.create({
      ...req.body,
      owner: req.user.id,
      status: "pending",
    });

    res.status(201).json({
      message: "House submitted for admin approval",
      house,
    });
  } catch (error) {
    console.error("createHouse:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * RENTER → VIEW APPROVED HOUSES
 */
exports.getApprovedHouses = async (req, res) => {
  try {
    const houses = await House.find({ status: "approved" }).populate(
      "owner",
      "fullName email"
    );
    res.json(houses);
  } catch (error) {
    console.error("getApprovedHouses:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * OWNER → VIEW OWN HOUSES
 */
exports.getOwnerHouses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const houses = await House.find({ owner: req.user.id });
    res.json(houses);
  } catch (error) {
    console.error("getOwnerHouses:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN → VIEW PENDING HOUSES
 */
exports.getPendingHouses = async (req, res) => {
  try {
    const houses = await House.find({ status: "pending" }).populate(
      "owner",
      "fullName email"
    );
    res.json(houses);
  } catch (error) {
    console.error("getPendingHouses:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN → APPROVE HOUSE
 */
exports.approveHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    res.json(house);
  } catch (error) {
    console.error("approveHouse:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN → REJECT HOUSE
 */
exports.rejectHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    res.json(house);
  } catch (error) {
    console.error("rejectHouse:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * OWNER / ADMIN → DELETE HOUSE
 */
exports.deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (
      house.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await house.deleteOne();
    res.json({ message: "House deleted" });
  } catch (error) {
    console.error("deleteHouse:", error);
    res.status(500).json({ message: error.message });
  }
};
