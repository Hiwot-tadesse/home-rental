// middleware/roleMiddleware.js
module.exports = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized: No user info found" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied. Required role: ${roles.join(", ")}` });
        }

        next();
    };
};
