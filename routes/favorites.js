// routes/favorites.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const House = require('../models/House'); // ✅ Must match your House model filename
const { isValidObjectId } = require('mongoose');

router.use(authMiddleware);

// ✅ GET /api/favorites — returns full house objects
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch only valid, existing houses
    const favoriteHouses = await House.find({
      _id: { $in: user.favorites }
    });

    res.json(favoriteHouses); // ✅ Array of full house objects
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Failed to load favorites' });
  }
});

// ✅ POST /api/favorites/:houseId — add to favorites
router.post('/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;

    if (!isValidObjectId(houseId)) {
      return res.status(400).json({ message: 'Invalid house ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Avoid duplicates
    if (!user.favorites.includes(houseId)) {
      user.favorites.push(houseId);
      await user.save();
    }

    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
});

// ✅ DELETE /api/favorites/:houseId — remove from favorites
router.delete('/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;

    if (!isValidObjectId(houseId)) {
      return res.status(400).json({ message: 'Invalid house ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== houseId.toString()
    );
    await user.save();

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
});

module.exports = router;