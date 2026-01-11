const House = require("../models/House");

// CREATE HOUSE (Owner only)
exports.createHouse = async (req, res) => {
  try {
    const { title, description, price, location, images } = req.body;

    const house = await House.create({
      title,
      description,
      price,
      location,
      images,
      owner: req.user.id
    });

    res.status(201).json({ message: "House listed successfully", house });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL HOUSES (Public)
exports.getHouses = async (req, res) => {
  try {
    const houses = await House.find({ status: "available" })
      .populate("owner", "name email");

    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE HOUSE
exports.getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id)
      .populate("owner", "name email");

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    res.json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE HOUSE (Owner or Admin)
exports.deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (house.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await house.deleteOne();
    res.json({ message: "House deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
