const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    validateCoupon
} = require('../controllers/couponController');

// Public route
router.post('/validate', validateCoupon);

// Admin routes
router.use(protect, adminOnly);
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.delete('/:id', deleteCoupon);

module.exports = router;
