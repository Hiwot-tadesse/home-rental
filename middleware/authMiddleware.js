const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Check for authorization header
    const authHeader = req.headers["authorization"]; // use lowercase for safety

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Extract token from "Bearer TOKEN"
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
