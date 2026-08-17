const Cart = require('../models/Cart');
const Plant = require('../models/Plant');

//Add To Cart
//API: POST /api/cart/add
const addToCart = async (req, res) => {
    try {
        const { plant, quantity } = req.body;
        const user = req.user._id;

        if (!plant || !quantity || Number(quantity) < 1) {
            return res.status(400).json({
                message: 'Please provide a valid plant and quantity'
            });
        }

        const plantData = await Plant.findById(plant);

        if (!plantData) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }

        const requestedQuantity = Number(quantity);

        if (plantData.stock < requestedQuantity) {
            return res.status(400).json({
                message: `Insufficient stock for ${plantData.name}`
            });
        }

        const existingCart = await Cart.findOne({
            user,
            plant
        });

        if (existingCart) {
            const newQuantity = existingCart.quantity + requestedQuantity;

            if (newQuantity > plantData.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for ${plantData.name}`
                });
            }

            existingCart.quantity = newQuantity;
            existingCart.totalPrice = existingCart.quantity * existingCart.price;

            await existingCart.save();

            return res.status(200).json({
                message: 'Cart Updated Successfully',
                existingCart
            });
        }

        //Create new cart item
        const cart = await Cart.create({
            user,
            plant,
            quantity: requestedQuantity,
            price: plantData.price,
            totalPrice: plantData.price * requestedQuantity
        });

        res.status(201).json({
            message: 'Plant Added To Cart',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get User Cart
//API: GET /api/cart/:userId
const getCart = async (req, res) => {
    try {
        const cart = await Cart.find({
            user: req.user._id
        })
            .populate('plant')
            .populate('user', '-password');

        res.status(200).json(cart);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Update Cart Quantity
//API: PUT /api/cart/:id
const updateCart = async (req, res) => {
    try {
        const { quantity } = req.body;
        const requestedQuantity = Number(quantity);

        if (!requestedQuantity || requestedQuantity < 1) {
            return res.status(400).json({
                message: 'Please provide a valid quantity'
            });
        }

        const cart = await Cart.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart Item Not Found'
            });
        }

        const plantData = await Plant.findById(cart.plant);

        if (!plantData) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }

        if (requestedQuantity > plantData.stock) {
            return res.status(400).json({
                message: `Insufficient stock for ${plantData.name}`
            });
        }

        cart.quantity = requestedQuantity;
        cart.totalPrice = cart.quantity * cart.price;

        await cart.save();

        res.status(200).json({
            message: 'Cart Updated Successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Remove Plant From Cart
//API: DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart Item Not Found'
            });
        }

        res.status(200).json({
            message: 'Cart Item Removed Successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Clear User Cart
//API: DELETE /api/cart/clear/:userId
const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({
            user: req.user._id
        });

        res.status(200).json({
            message: 'Cart Cleared Successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get Cart Total Cart Amount 
//API: GET /api/cart/total/:userId
const getCartTotal = async (req, res) => {
    try {
        const cartItems = await Cart.find({
            user: req.user._id
        });

        const totalAmount = cartItems.reduce((total, item) => {
            return total + item.totalPrice;
        }, 0);

        res.status(200).json({
            totalAmount
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart,
    getCartTotal
};