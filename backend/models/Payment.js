const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true
        },

        order: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Order',
            required: true
        },

        paymentId: {
            type: String,
            required: true
        },

        transactionId: {
            type: String
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: 'INR'
        },

        paymentMethod: {
            type: String,
            enum: [
                'COD',
                'UPI',
                'Card',
                'Net Banking'
            ],
            required: true
        },

        status: {
            type: String,
            enum: [
                'Pending',
                'Success',
                'Failed',
                'Refunded'
            ],
            default: 'Pending'
        },

        PaymentResponse: {
            type: Object
        },

        paymentDate: {
            type: Date,
            default: Date.now
        },

        refundDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Payment', paymentSchema);