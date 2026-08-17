const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

const {
    createOrder,
    getAllOrders,
    getUserOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    returnOrder,
    deleteOrder
} = require("../controllers/orderController");

router.post('/create', protect, createOrder);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/user/:userId', protect, getUserOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, returnOrder);
router.get('/:id', protect, getOrderById);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
