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

router.get("/houses", async (req, res) => {
  try {
    const houses = await House.find().populate("owner", "fullName email");
    res.status(200).json({ success: true, houses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/houses/:id/approve", async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.status(200).json({ success: true, house });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/houses/:id/reject", async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.status(200).json({ success: true, house });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullName email name")
      .populate("house", "title location price city images status");

    const formattedBookings = bookings.map(booking => {
      const userName = booking.user?.fullName || booking.user?.name || 'Unknown Renter';
      const userEmail = booking.user?.email || 'No email';

      const houseData = booking.house ? {
        ...booking.house.toObject(),
        owner_id: booking.house.owner ? booking.house.owner.toString() : null
      } : null;

      return {
        id: booking._id.toString(),
        property_id: booking.house ? booking.house._id.toString() : null,
        renter_id: booking.user ? booking.user._id.toString() : null,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        property: houseData,
        renter: booking.user ? {
          id: booking.user._id.toString(),
          fullName: userName,
          email: userEmail
        } : null
      };
    });

    res.status(200).json({ success: true, bookings: formattedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use "approved" or "rejected".' });
    }

    const booking = await Booking.findById(id)
      .populate('house', 'owner title city price images')
      .populate('user', 'fullName email name');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (status === 'rejected') {
      await Booking.findByIdAndDelete(id);
      return res.status(200).json({ 
        success: true, 
        message: "Booking rejected and removed",
        deleted: true 
      });
    }

    if (status === 'approved') {
      booking.status = 'approved';
      booking.updatedAt = new Date();
      await booking.save();

      if (booking.house) {
        await House.findByIdAndUpdate(booking.house._id, { status: 'rented' });
      }

      const userName = booking.user?.fullName || booking.user?.name || 'Unknown Renter';
      const userEmail = booking.user?.email || 'No email';

      const formattedBooking = {
        id: booking._id.toString(),
        property_id: booking.house?._id?.toString() || null,
        renter_id: booking.user?._id?.toString() || null,
        status: 'approved',
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        property: booking.house ? {
          id: booking.house._id.toString(),
          title: booking.house.title,
          city: booking.house.city,
          price: booking.house.price,
          images: booking.house.images || [],
          owner_id: booking.house.owner?.toString() || null
        } : null,
        renter: booking.user ? {
          id: booking.user._id.toString(),
          fullName: userName,
          email: userEmail
        } : null
      };

      return res.status(200).json({ success: true, booking: formattedBooking });
    }

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

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