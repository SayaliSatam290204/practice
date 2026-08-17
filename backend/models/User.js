const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: [true, "Password is required"],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    city: {
        type: String,
        required: [true, "City is required"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
    },
    pincode: {
        type: String,
        required: [true, "Pincode is required"],
    },
    profileImage: {
        type: String,
        default: ""
    },
    addresses: [{
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        type: { type: String, enum: ['Home', 'Work'], default: 'Home' },
        isDefault: { type: Boolean, default: false }
    }],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    active: {
        type: Boolean,
        default: true
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);