const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Plant name is required"],
        trim: true,
    },
    scientificName: {
        type: String,
        trim: true,
    },
    categoryGroup: {
        type: String,
        required: [true, 'Category Group is required'],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: [
            "Indoor",
            "Outdoor",
            "Succulent",
            "Flowering",
            "Foliage",
            "Medicinal",
            "Bonsai",
            "Fruit",
            "Vegetable",
            "Herb",
            "Cactus",
            "Orchid",
            "Hanging Plant",
            "Climbing Plant",
            "Seeds"],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    discountPrice: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: 0,
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    height: {
        type: String,
        required: [true, 'Height is required'],
    },
    potSize: {
        type: String,
        required: [true, 'Pot Size is required'],
    },
    sunlight: {
        type: String,
        required: [true, 'Sunlight is required'],
        enum: [
            "Full Sun",
            "Partial Sun",
            "Shade"
        ]
    },
    watering: {
        type: String,
        required: [true, 'Watering is required'],
        enum: [
            "Daily",
            "Every 2-3 weeks",
            "Every 10-15 days",
            "Weekly",
            "Alternate days"
        ]
    },
    temperature: {
        type: String,
        required: [true, 'Temperature is required'],
    },
    fertilizer: {
        type: String,
        required: [true, 'Fertilizer is required'],
    },
    isIndoor: {
        type: Boolean,
        required: true,
    },
    isOutdoor: {
        type: Boolean,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    active: {
        type: Boolean,
        default: true
    },

});

module.exports = mongoose.model('Plant', plantSchema);
