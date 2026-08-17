const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect Routes
// Checks whether the user is logged in
const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        // Check whether Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Please login first."
            });
        }

        // Get token from: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user from database
        const user = await User.findById(decoded.id)
            .select("-password");


        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // Store logged-in user in request
        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
};

// Admin Only Middleware
// Allows only users with admin role

const adminOnly = (req, res, next) => {

    // req.user comes from protect middleware
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({
        message: "Access denied. Admin only."
    });

};


module.exports = {
    protect,
    adminOnly
};