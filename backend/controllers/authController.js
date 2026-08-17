const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// User Registration
// API: POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body;

        // Check required fields
        if (!name || !email || !password || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                message: "All registration fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        // Hash Password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            pincode,
            role: "user"
        });

        // Remove password before sending response
        const userResponse = user.toObject();

        delete userResponse.password;

        res.status(201).json({
            message: "User Registered Successfully",
            token: generateToken(user._id),
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// User Login
// API: POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find only normal user
        const user = await User.findOne({
            email,
            role: "user"
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Compare password
        const matchPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!matchPassword) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        // Remove password from response
        const userResponse = user.toObject();

        delete userResponse.password;

        res.status(200).json({
            message: "Login Successful",
            token: generateToken(user._id),
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Admin Registration
// API: POST /api/auth/admin/register
const registerAdmin = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body;

        // Check required fields
        if (!name || !email || !password || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                message: "All admin registration fields are required"
            });
        }

        // Check if email already exists
        const existingAdmin = await User.findOne({
            email
        });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Admin
        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            pincode,
            role: "admin"
        });

        // Remove password before response
        const adminResponse = admin.toObject();

        delete adminResponse.password;

        res.status(201).json({
            message: "Admin Registered Successfully",
            token: generateToken(admin._id),
            admin: adminResponse
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Admin Login
// API: POST /api/auth/admin/login
const loginAdmin = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find only admin
        const admin = await User.findOne({
            email,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        // Compare password
        const matchPassword = await bcrypt.compare(
            password,
            admin.password
        );

        if (!matchPassword) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        // Remove password from response
        const adminResponse = admin.toObject();

        delete adminResponse.password;

        res.status(200).json({
            message: "Admin Login Successful",
            token: generateToken(admin._id),
            admin: adminResponse
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Profile
// API: GET /api/auth/profile
// Protected API
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Change Password
// API: PUT /api/auth/change-password
// Protected API
const changePassword = async (req, res) => {
    try {
        const {
            oldPassword,
            newPassword
        } = req.body;

        // Check required fields
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Old password and new password are required"
            });
        }

        // Find logged-in user
        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check old password
        const matchPassword = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!matchPassword) {
            return res.status(400).json({
                message: "Old Password is Incorrect"
            });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({
            message: "Password Changed Successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    registerAdmin,
    loginAdmin,
    getProfile,
    changePassword
};