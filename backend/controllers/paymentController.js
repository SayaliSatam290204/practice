const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

//Create Payment
//API: POST /api/payment/create
const createPayment = async (req, res) => {
    try {
        const {
            user,
            order,
            paymentId,
            transactionId,
            amount,
            currency,
            paymentMethod
        } = req.body;

        //Check whether order exists
        const orderData = await Order.findById(order);

        if (!orderData) {
            return res.status(404).json({
                message: 'Order Not Found'
            });
        }

        //create payment record
        const payment = await Payment.create({
            user,
            order,
            paymentId,
            transactionId,
            amount,
            currency: currency || 'INR',
            paymentMethod,
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Payment Created Successfully',
            payment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

//Update Payment Status
//API: PUT /api/payment/:id/status
const updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                message: 'Payment Not Found'
            });
        }

        //Update Payment Status
        payment.status = status;
        if (status === 'Success') {
            payment.paymentDate = new Date();
        }

        await payment.save();

        //Update related order payment status 
        const order = await Order.findById(payment.order);

        if (order) {
            if (status === 'Success') {
                order.paymentStatus = 'Paid';
            } else if (status === 'Failed') {
                order.paymentStatus = 'Failed';
            } else if (status === 'Refunded') {
                order.paymentStatus = 'Refunded';
            }

            await order.save();
        }

        res.status(200).json({
            message: 'Payment Status Updated Successfully',
            payment,
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Payment By ID
//API: GET /api/payment/:id
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', '-password')
            .populate('order');

        if (!payment) {
            return res.status(404).json({
                message: 'Payment Not Found'
            });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get User Payment
//API: GET /api/payment/user/:userId
const getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            user: req.params.userId
        })
            .populate('order');

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get All Payments
//API: GET /api/payment
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', '-password')
            .populate('order');

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Refund Payment
//API: PUT /api/payment/:id/refund
const refundPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                message: 'Payment Not Found'
            });
        }

        if (payment.status !== 'Success') {
            return res.status(400).json({
                message: 'Only successful payments can be refunded'
            });
        }

        payment.status = 'Refunded';
        payment.refundDate = new Date();

        await payment.save();

        const order = await Order.findById(payment.order);

        if (order) {
            order.paymentStatus = 'Refunded';
            await order.save();
        }

        res.status(200).json({
            message: 'Payment Refunded Successfully',
            payment,
            order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Create Razorpay Order
// API: POST /api/payment/razorpay/create-order
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount) return res.status(400).json({ message: 'Amount is required' });

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: "INR",
            receipt: "receipt_order_" + Math.random().toString(36).substring(7),
        };

        const order = await instance.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Create Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Verify Razorpay Payment
// API: POST /api/payment/razorpay/verify
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Update order status
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order) {
                    order.paymentStatus = 'Paid';
                    await order.save();
                    
                    // Create Payment record
                    await Payment.create({
                        user: req.user._id,
                        order: orderId,
                        paymentId: razorpay_payment_id,
                        transactionId: razorpay_order_id,
                        amount: order.totalAmount,
                        currency: 'INR',
                        paymentMethod: 'Card',
                        status: 'Success'
                    });
                }
            }
            return res.status(200).json({ message: "Payment verified successfully", success: true });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!", success: false });
        }
    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports = {
    createPayment,
    updatePaymentStatus,
    getPaymentById,
    getUserPayments,
    getAllPayments,
    refundPayment,
    createRazorpayOrder,
    verifyRazorpayPayment
};