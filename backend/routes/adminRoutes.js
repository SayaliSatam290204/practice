const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

const {
    getDashboardStats,
    getAllUsers,
    getUserById,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    getAllPlants,
    updatePlantStatus,
    getAllReviews,
    updateReviewApproval
} = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/plants', getAllPlants);
router.put('/plants/:id/status', updatePlantStatus);
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/approval', updateReviewApproval);


module.exports = router;