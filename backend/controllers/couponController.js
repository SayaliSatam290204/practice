const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, expiryDate } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

        if (couponExists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercentage,
            expiryDate
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Coupon removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Please provide a coupon code' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.active) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        res.status(200).json({
            message: 'Coupon is valid',
            discountPercentage: coupon.discountPercentage,
            code: coupon.code
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    validateCoupon
};
