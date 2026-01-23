const House = require("../models/House");

// GET ALL HOUSES (ADMIN)
exports.getAllHouses = async (req, res) => {
  const houses = await House.find()
    .populate("owner", "name email");
  res.json(houses);
};

// APPROVE
exports.approveHouse = async (req, res) => {
  const house = await House.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );
  res.json(house);
};

// REJECT
exports.rejectHouse = async (req, res) => {
  const house = await House.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );
  res.json(house);
};
