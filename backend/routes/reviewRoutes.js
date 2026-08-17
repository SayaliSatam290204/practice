const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

const {
    createReview,
    getAllReviews,
    getReviewsByPlant,
    getReviewsByUser,
    updateReview,
    deleteReview,
    approveReview,
    getPendingReviews
} = require("../controllers/reviewController");

router.post('/create', protect, createReview);
router.get('/', getAllReviews);
router.get('/pending', protect, adminOnly, getPendingReviews);
router.get('/plant/:plantId', getReviewsByPlant);
router.get('/user/:userId', protect, getReviewsByUser);
router.put('/:id/approve', protect, adminOnly, approveReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);


module.exports = router;