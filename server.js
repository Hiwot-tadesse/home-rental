require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const houseRoutes = require('./routes/houseRoutes');
const listingRoutes = require('./routes/listingRoutes');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/booking');
const favoriteRoutes = require('./routes/favorites');

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);



const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MongoDB connection string missing. Set MONGO_URI in .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB Error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
