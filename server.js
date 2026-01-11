const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/houses", require("./routes/houseRoutes"));

const bookingRoutes = require('./routes/booking');
app.use('/api/bookings', bookingRoutes);

const favoritesRoutes = require("./routes/favorites");
app.use("/api/favorites", favoritesRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));