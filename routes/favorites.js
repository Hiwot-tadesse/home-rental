const express = require("express");
const router = express.Router();
const User = require("../models/User");
const House = require("../models/House");
const authMiddleware = require("../middleware/authMiddleware");

// ----------------------
// ADD a house to favorites
// ----------------------
router.post("/:houseId", authMiddleware, async (req, res) => {
    try {
        const { houseId } = req.params;

        // Check if house exists
        const house = await House.findById(houseId);
        if (!house) return res.status(404).json({ message: "House not found" });

        // Add to favorites if not already there
        const user = await User.findById(req.user.id);
        if (user.favorites.includes(houseId)) {
            return res.status(400).json({ message: "House already in favorites" });
        }

        user.favorites.push(houseId);
        await user.save();

        return res.status(200).json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// ----------------------
// REMOVE a house from favorites
// ----------------------
router.delete("/:houseId", authMiddleware, async (req, res) => {
    try {
        const { houseId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user.favorites.includes(houseId)) {
            return res.status(400).json({ message: "House not in favorites" });
        }

        user.favorites = user.favorites.filter(fav => fav.toString() !== houseId);
        await user.save();

        return res.status(200).json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// ----------------------
// GET all favorite houses
// ----------------------
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("favorites");
        return res.status(200).json({ success: true, favorites: user.favorites });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
