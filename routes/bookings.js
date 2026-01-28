// routes/bookings.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const House = require('../models/House');

router.use(authMiddleware);

// POST create booking
router.post('/', async (req, res) => {
  try {
    const { houseId } = req.body;
    
    // Validate house exists and is approved
    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: 'House not found' });
    if (house.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot book unapproved property' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      house: houseId,
      status: 'pending'
    });
    
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user's bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('house', 'title location price')
      .populate('owner', 'fullName email'); // You'll need to add owner reference to House model
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;