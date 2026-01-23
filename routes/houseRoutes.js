const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  createHouse,
  getApprovedHouses,
  getOwnerHouses,
  getPendingHouses,
  approveHouse,
  rejectHouse,
  deleteHouse,
} = require("../controllers/houseController");

// --------------------
// RENTER (PUBLIC)
// --------------------
router.get("/", getApprovedHouses);

// --------------------
// OWNER
// --------------------
router.post("/", auth, createHouse);
router.get("/my-houses", auth, getOwnerHouses);

// --------------------
// ADMIN
// --------------------
router.get("/pending", auth, admin, getPendingHouses);
router.patch("/:id/approve", auth, admin, approveHouse);
router.patch("/:id/reject", auth, admin, rejectHouse);

// --------------------
// OWNER / ADMIN
// --------------------
router.delete("/:id", auth, deleteHouse);

module.exports = router;
