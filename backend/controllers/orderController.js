const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Plant = require('../models/Plant');
const Coupon = require('../models/Coupon');

//Create Order
//API: POST /api/orders/create
const createOrder = async (req, res) => {
    try {
        const {
            shippingAddress,
            city,
            state,
            pincode,
            phone,
            paymentMethod,
            frontendCartItems,
            couponCode
        } = req.body;
        const user = req.user._id;

        let processedCartItems = [];
        let totalAmount = 0;

        if (frontendCartItems && frontendCartItems.length > 0) {
            // Use cart items from frontend
            for (const item of frontendCartItems) {
                const plantData = await Plant.findById(item._id); // In frontend, item._id is the plant ID
                if (!plantData) {
                    return res.status(404).json({ message: 'Plant Not Found' });
                }
                if (item.quantity > plantData.stock) {
                    return res.status(400).json({ message: `Insufficient stock for ${plantData.name}` });
                }
                
                const itemPrice = plantData.discountPrice && plantData.discountPrice < plantData.price 
                    ? plantData.discountPrice 
                    : plantData.price;

                processedCartItems.push({
                    plant: plantData,
                    quantity: item.quantity,
                    price: itemPrice,
                    totalPrice: itemPrice * item.quantity
                });
                totalAmount += (itemPrice * item.quantity);
            }
        } else {
            // Fallback to database cart
            const dbCartItems = await Cart.find({ user }).populate('plant');
            
            if (dbCartItems.length === 0) {
                return res.status(400).json({ message: "Your Cart Is Empty" });
            }

            for (const item of dbCartItems) {
                if (!item.plant) {
                    return res.status(404).json({ message: 'Plant Not Found' });
                }
                if (item.quantity > item.plant.stock) {
                    return res.status(400).json({ message: `Insufficient stock for ${item.plant.name}` });
                }
                processedCartItems.push({
                    plant: item.plant,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice
                });
                totalAmount += item.totalPrice;
            }
        }

        //create the order items
        const items = processedCartItems.map((item) => ({
            plant: item.plant._id,
            name: item.plant.name,
            image: item.plant.image,
            category: item.plant.category,
            quantity: item.quantity,
            price: item.price
        }));

        // Apply coupon discount if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.active && new Date(coupon.expiryDate) >= new Date()) {
                const discount = Math.round(totalAmount * (coupon.discountPercentage / 100));
                totalAmount -= discount;
            }
        }

        //create the order
        const order = await Order.create({
            user,
            items,
            totalAmount,
            paymentMethod,
            shippingAddress,
            city,
            state,
            pincode,
            phone,
            statusHistory: [
                {
                    status: "Pending"
                }
            ]
        });

        for (const item of processedCartItems) {
            const plantData = await Plant.findById(item.plant._id);

            if (!plantData) {
                await Order.findByIdAndDelete(order._id);
                return res.status(404).json({ message: 'Plant Not Found' });
            }

            if (plantData.stock < item.quantity) {
                await Order.findByIdAndDelete(order._id);
                return res.status(400).json({ message: `Insufficient stock for ${plantData.name}` });
            }

            plantData.stock -= item.quantity;
            await plantData.save();
        }

        //Clear cart after successful order creation and stock update
        await Cart.deleteMany({
            user
        });

        res.status(201).json({
            message: 'Order Created Successfully',
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get All Orders
//API: GET /api/orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', '-password')
            .populate('items.plant');

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
};

//Get User Orders
//API: GET /api/orders/user/:userId
const getUserOrders = async (req, res) => {
    try {
        const requestedUserId = req.params.userId;

        if (req.user.role !== 'admin' && requestedUserId !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only view your own orders.'
            });
        }

        const orders = await Order.find({
            user: requestedUserId
        })
            .populate('items.plant');

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
};

//Get My Orders
//API: GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.plant')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        require('fs').writeFileSync('c:/Users/mayur/Documents/practice/backend/error_log.txt', error.stack || error.message);
        res.status(500).json({ message: error.message });
    }
};

//Get Order By ID
//API: GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.plant')
            .populate('user', '-password');

        if (!order) {
            return res.status(404).json({
                message: "Order Not Found"
            });
        }

        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only view your own orders.'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, trackingNumber } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order Not Found'
            });
        }

        // Define valid transitions
        const validTransitions = {
            "Pending": ["Confirmed", "Cancelled"],
            "Confirmed": ["Packed", "Cancelled"],
            "Packed": ["Shipped", "Cancelled"],
            "Shipped": ["Delivered", "Cancelled"],
            "Delivered": [],
            "Cancelled": []
        };

        const allowedNextStates = validTransitions[order.orderStatus] || [];
        
        if (!allowedNextStates.includes(orderStatus)) {
            return res.status(400).json({
                message: `Invalid status transition from ${order.orderStatus} to ${orderStatus}`
            });
        }

        if (orderStatus === "Shipped" && !trackingNumber) {
            return res.status(400).json({
                message: 'Tracking number is required to ship an order.'
            });
        }

        // Update fields
        order.orderStatus = orderStatus;

        let note = "";
        if (orderStatus === "Shipped" && trackingNumber) {
            order.trackingNumber = trackingNumber;
            note = `Tracking Number: ${trackingNumber}`;
        }

        // Add to history
        order.statusHistory.push({
            status: orderStatus,
            note: note || undefined
        });

        // Set delivery date when order is delivered
        if (orderStatus === 'Delivered') {
            order.deliveredAT = new Date();
        }

        await order.save();

        res.status(200).json({
            message: 'Order Status Updated Successfully',
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Cancel Order
//API: PUT /api/orders/:id
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order Not Found'
            });
        }

        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only cancel your own orders.'
            });
        }

        //Check if order can be cancelled
        if (
            order.orderStatus === 'Shipped' ||
            order.orderStatus === 'Delivered'
        ) {
            return res.status(400).json({
                message: 'Order Cannot be Cancelled'
            });
        }

        order.orderStatus = 'Cancelled';
        order.statusHistory.push({ status: 'Cancelled' });

        await order.save();


        res.status(200).json({
            message: 'Order Cancelled Successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Return Order
//API: PUT /api/orders/:id/return
const returnOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order Not Found'
            });
        }

        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only return your own orders.'
            });
        }

        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({
                message: 'Only delivered orders can be returned.'
            });
        }

        order.orderStatus = 'Returned';
        order.statusHistory.push({ status: 'Returned' });

        await order.save();

        res.status(200).json({
            message: 'Order Return Requested Successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Delete Order
//API: DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order Not Found'
            });
        }

        res.status(200).json({
            message: 'Order Deleted Successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getUserOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    returnOrder,
    deleteOrder
};