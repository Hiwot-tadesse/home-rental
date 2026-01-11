const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware"); // dynamic

const {
  createHouse,
  getHouses,
  getHouseById,
  deleteHouse
} = require("../controllers/houseController");

// Public routes
router.get("/", getHouses);
router.get("/:id", getHouseById);

// Protected routes (Owner/Admin only)
router.post("/", auth, roleMiddleware(["owner", "admin"]), createHouse);
router.delete("/:id", auth, roleMiddleware(["owner", "admin"]), deleteHouse);

module.exports = router;
