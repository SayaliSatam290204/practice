const Review = require('../models/Review');
const Plant = require('../models/Plant');

//Create Review 
//API: POST /api/reviews/create
const createReview = async (req, res) => {
    try {
        const {
            plant,
            rating,
            comment,
            images
        } = req.body;
        const user = req.user._id;

        //Check whether plant exists
        const plantData = await Plant.findById(plant);

        if (!plantData) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }

        //Check if the user already reviewed this plant 
        const existingReview = await Review.findOne({
            user,
            plant
        });

        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this plant'
            });
        }

        //Create Review
        const review = await Review.create({
            user,
            plant,
            rating,
            comment,
            images
        });

        //Add review ID to Plant reviews array
        plantData.reviews.push(review._id);

        await plantData.save();

        res.status(201).json({
            message: 'Review added succesfully',
            review
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

//Get All Reviews
//API: GET /api/reviews/
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('plant');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch reviews',
            error
        })
    }
};

//Get Reviews By Plant
//API: GET /api/reviews/plant/:plantId
const getReviewsByPlant = async (req, res) => {
    try {
        const reviews = await Review.find({
            plant: req.params.plantId,
            approved: true
        })
            .populate('user', 'name');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch reviews',
            error
        });
    }
};

//Get Reviews By User
//API: GET /api/reviews/user/:userId
const getReviewsByUser = async (req, res) => {
    try {
        const reviews = await Review.find({
            user: req.params.userId
        })
            .populate('plant');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch reviews',
            error
        });
    }
};

// Update Review
// API: PUT /api/reviews/:id
const updateReview = async (req, res) => {
    try {
        const {
            rating,
            comment,
            images
        } = req.body;

        let review = await Review.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!review) {
            const existingReview = await Review.findById(req.params.id);

            if (existingReview) {
                return res.status(403).json({
                    message: 'You are not authorized to update this review'
                });
            }

            return res.status(404).json({
                message: 'Review Not Found'
            });
        }

        review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                rating,
                comment,
                images,

                // Review needs admin approval again after update
                approved: false
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: 'Review Updated Successfully',
            review
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update review',
            error: error.message
        });
    }
};

//Delete Review
//API: DELETE /api/reviews/:reviewId
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!review) {
            const existingReview = await Review.findById(req.params.id);

            if (existingReview) {
                return res.status(403).json({
                    message: 'You are not authorized to delete this review'
                });
            }

            return res.status(404).json({
                message: 'Review Not Found'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        //Remove review ID from Plant reviews array
        await Plant.findByIdAndUpdate(
            review.plant,
            {
                $pull: {
                    reviews: review._id
                }
            }
        );

        res.status(200).json({
            message: 'Review Deleted Successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete review',
            error
        });
    }
};

//Approve Review
//API: PUT /api/reviews/:id/approve
const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                approved: true
            },
            {
                new: true
            }
        );

        if (!review) {
            return res.status(404).json({
                message: 'Review Not Found'
            })
        }

        res.status(200).json({
            message: 'Review Approved Successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to approve review',
            error
        });
    }
};

//Get Pending Reviews
//API: GET /api/reviews/pending
const getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            approved: false
        })
            .populate('user', 'name email')
            .populate('plant', 'name');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch reviews',
            error
        });
    }
};
module.exports = {
    createReview,
    getAllReviews,
    getReviewsByPlant,
    getReviewsByUser,
    updateReview,
    deleteReview,
    approveReview,
    getPendingReviews
};