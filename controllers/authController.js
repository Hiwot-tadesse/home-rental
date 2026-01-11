const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Return user **without password**
        const userWithoutPassword = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return user without password
        const userWithoutPassword = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({
            message: "Login successful",
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
