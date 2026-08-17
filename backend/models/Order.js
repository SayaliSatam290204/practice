const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                plant: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Plant',
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "UPI",
                "Card",
                "Net Banking"
            ],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],
            default: "Pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Packed",
                "Shipped",
                "Delivered",
                "Cancelled",
                "Returned"
            ],
            default: "Pending"
        },

        statusHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        "Pending",
                        "Confirmed",
                        "Packed",
                        "Shipped",
                        "Delivered",
                        "Cancelled",
                        "Returned"
                    ],
                    required: true
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                note: {
                    type: String
                }
            }
        ],

        trackingNumber: {
            type: String
        },

        shippingAddress: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        pincode: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        deliveredAT: {
            type: Date
        }

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Order", orderSchema);