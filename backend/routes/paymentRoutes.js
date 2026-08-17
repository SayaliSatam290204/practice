const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

const {
    createPayment,
    updatePaymentStatus,
    getPaymentById,
    getUserPayments,
    getAllPayments,
    refundPayment,
    createRazorpayOrder,
    verifyRazorpayPayment
} = require("../controllers/paymentController");

router.post('/create', protect, createPayment);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.get('/', protect, adminOnly, getAllPayments);
router.get('/user/:userId', protect, getUserPayments);
router.put('/:id/status', protect, adminOnly, updatePaymentStatus);
router.put('/:id/refund', protect, adminOnly, refundPayment);
router.get('/:id', protect, getPaymentById);


module.exports = router;