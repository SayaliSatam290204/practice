const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart,
    getCartTotal
} = require("../controllers/cartController");

router.post('/add', protect, addToCart);
router.get('/total/:userId', protect, getCartTotal);
router.get('/:userId', protect, getCart);
router.put('/:id', protect, updateCart);
router.delete('/clear/:userId', protect, clearCart);
router.delete('/:id', protect, removeFromCart);

module.exports = router;