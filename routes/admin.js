const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");
const House = require("../models/House");
const Booking = require("../models/Booking");

router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").populate("favorites");
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.remove();
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET all houses

router.get("/houses", async (req, res) => {
    try {
        const houses = await House.find().populate("owner", "name email");
        res.status(200).json({ success: true, houses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// DELETE a house

router.delete("/houses/:id", async (req, res) => {
    try {
        const house = await House.findById(req.params.id);
        if (!house) return res.status(404).json({ message: "House not found" });

        await house.remove();
        res.status(200).json({ success: true, message: "House deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET all bookings

router.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user", "name email")
            .populate("house", "title location price");
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Dashboard Stats

router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalHouses = await House.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalFavorites = await User.aggregate([
            { $project: { favCount: { $size: "$favorites" } } },
            { $group: { _id: null, total: { $sum: "$favCount" } } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalHouses,
                totalBookings,
                totalFavorites: totalFavorites[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
