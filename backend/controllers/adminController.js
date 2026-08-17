const User = require('../models/User');
const Plant = require('../models/Plant');
const Order = require('../models/Order');
const Review = require('../models/Review');

//Get Dashboard Statistics
//API : GET /api/admin/dashboard 
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({
            role: 'user'
        });

        const totalAdmins = await User.countDocuments({
            role: 'admin'
        });

        const totalPlants = await Plant.countDocuments();

        const activePlants = await Plant.countDocuments({
            active: true
        });

        const totalOrders = await Order.countDocuments();

        const pendingOrders = await Order.countDocuments({
            orderStatus: 'Pending'
        });

        const deliveredOrdes = await Order.countDocuments({
            orderStatus: 'Delivered'
        });

        const cancelledOrders = await Order.countDocuments({
            orderStatus: 'Cancelled'
        });

        const totalReviews = await Review.countDocuments();

        const pendingReviews = await Review.countDocuments({
            approved: false
        });

        const approvedReviews = await Review.countDocuments({
            approved: true
        });

        // 1. Recent Orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // 2. Low Stock Plants
        const lowStockPlants = await Plant.find({ stock: { $lte: 5 } })
            .select('name stock price image')
            .limit(10);

        // 3. Chart Data (Last 7 Days Orders & Revenue)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentOrdersForChart = await Order.find({
            createdAt: { $gte: sevenDaysAgo }
        }).select('totalAmount createdAt');

        // Group by day
        const chartDataMap = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartDataMap[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
        }

        recentOrdersForChart.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (chartDataMap[dateStr]) {
                chartDataMap[dateStr].orders += 1;
                chartDataMap[dateStr].revenue += order.totalAmount;
            }
        });

        const chartData = Object.values(chartDataMap);

        res.status(200).json({
            stats: {
                totalUsers,
                totalAdmins,
                totalPlants,
                activePlants,
                totalOrders,
                pendingOrders,
                deliveredOrdes,
                cancelledOrders,
                totalReviews,
                pendingReviews,
                approvedReviews
            },
            recentOrders,
            lowStockPlants,
            chartData,
            message: 'Dashboard statistics fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch dashboard statistics',
            error
        });
    }
};

//Get All Normal Users
//API: GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: 'user'
        })
            .select('-password');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch users',
            error
        });
    }
};

//Get User By Id
//API : GET /api/admin/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            role: 'user'
        })
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User Not Found'
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch user',
            error
        });
    }
};

//Delete User
//API : DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            _id: req.params.id,
            role: 'user'
        });

        if (!user) {
            return res.status(404).json({
                message: 'User Not Found'
            })
        }

        res.status(200).json({
            message: 'User Deleted Successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete user',
            error
        })
    }
};

//Get All Orders
//API: GET /api/admin/orders/
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email phone')
            .populate('items.plant', 'name price image');

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch orders',
            error
        });
    }
};

//Update Order Status
//API : PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                orderStatus
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: 'Order Not Found'
            });
        }

        if (orderStatus === 'Delivered') {
            order.deliveredAT = new Date();

            await order.save();
        }

        res.status(200).json({
            message: 'Order Status Updated Successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update order status',
            error
        });
    }
};

//Get All Plants For Admin
//API: GET /api/admin/plants/
const getAllPlants = async (req, res) => {
    try {
        const plants = await Plant.find();

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch plants',
            error
        });
    }
};

//U[date Plant Active status
//API: PUT /api/admin/plants/:id/status
const updatePlantStatus = async (req, res) => {
    try {
        const { active } = req.body;

        const plant = await Plant.findByIdAndUpdate(
            req.params.id,
            {
                active
            },
            {
                new: true
            }
        );

        if (!plant) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }

        res.status(200).json({
            message: 'Plant Status Updated Successfully',
            plant
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update plant status',
            error
        });
    }
};

//Get All Reviews for Admin
//API: GET /api/admin/reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('plant', 'name image');

        res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update Review Approval Status
// API: PUT /api/admin/reviews/:id/approval
const updateReviewApproval = async (req, res) => {
    try {

        const { approved } = req.body;


        const review = await Review.findByIdAndUpdate(

            req.params.id,

            {
                approved
            },

            {
                new: true
            }

        );


        if (!review) {
            return res.status(404).json({
                message: "Review Not Found"
            });
        }


        res.status(200).json({

            message: "Review Approval Status Updated Successfully",

            review

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};



module.exports = {
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
};