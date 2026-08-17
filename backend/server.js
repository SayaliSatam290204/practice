require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const plantRoutes = require("./routes/plantRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const couponRoutes = require("./routes/couponRoutes");

// Error Middleware

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// Connect MongoDB
if (process.env.NODE_ENV !== "test") {
    connectDB();
}

// API Routes
// User APIs
app.use("/api/users", userRoutes);

// Authentication APIs
app.use("/api/auth", authRoutes);

// Plant APIs
app.use("/api/plants", plantRoutes);

// Cart APIs
app.use("/api/cart", cartRoutes);

// Order APIs
app.use("/api/orders", orderRoutes);

// Payment APIs
app.use("/api/payments", paymentRoutes);

// Review APIs
app.use("/api/reviews", reviewRoutes);

// Admin APIs
app.use("/api/admin", adminRoutes);

// Coupon APIs
app.use("/api/coupons", couponRoutes);

// Home / Test API
// GET /
app.get("/", (req, res) => {
    res.status(200).send(
        "Plant Nursery API is running..."
    );
});

// 404 Not Found Middleware
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(
            `Server is running on port ${PORT}`
        );
    });
}

module.exports = app;