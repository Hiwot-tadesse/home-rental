const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

router.use(authMiddleware);

// ✅ GET user's favorite properties
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ ADD to favorites - using POST with houseId in URL
router.post('/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;
    
    // Validate houseId format
    if (!houseId || houseId.length !== 24) {
      return res.status(400).json({ message: 'Invalid house ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(houseId)) {
      user.favorites.push(houseId);
      await user.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ REMOVE from favorites
router.delete('/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;
    
    if (!houseId || houseId.length !== 24) {
      return res.status(400).json({ message: 'Invalid house ID' });
    }

    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(fav => fav.toString() !== houseId);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;