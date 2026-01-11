const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const House = require("../models/House");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { houseId, message } = req.body;

        // Check if house exists
        const house = await House.findById(houseId);
        if (!house) return res.status(404).json({ message: "House not found" });

        // Create booking
        const booking = await Booking.create({
            house: houseId,
            user: req.user.id, // comes from auth middleware
            message
        });

        return res.status(201).json({ success: true, booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// --------------------------------
// OWNER: Get all bookings for houses they own
// --------------------------------
router.get("/owner", authMiddleware, async (req, res) => {
    try {
        // Find all bookings where the house is owned by this user
        const bookings = await Booking.find()
            .populate("house")
            .populate("user");

        // Filter bookings for houses that belong to the owner
        const ownerBookings = bookings.filter(
            (b) => b.house.owner.toString() === req.user.id
        );

        return res.status(200).json({ success: true, bookings: ownerBookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// ----------------------
// OWNER: Accept or Reject booking
// ----------------------
router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body; // "Accepted" or "Rejected"
        if (!["Accepted", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const booking = await Booking.findById(req.params.id).populate("house");
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Only owner can update
        if (booking.house.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        booking.status = status;
        await booking.save();

        return res.status(200).json({ success: true, booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
