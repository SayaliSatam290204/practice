const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'c:/Users/mayur/Documents/practice/backend/.env' });

const run = async () => {
    try {
        console.log("Starting test script...");
        
        // We will query mongoose to get ANY user and create a token.
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('c:/Users/mayur/Documents/practice/backend/models/User.js');
        const user = await User.findOne({});
        if(!user) {
            console.log("No users found in database");
            process.exit(0);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key');
        
        // Fetch my-orders
        const res2 = await fetch('http://localhost:5000/api/orders/my-orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Auth status:", res2.status);
        const text2 = await res2.text();
        console.log("Auth body:", text2);

    } catch (err) {
        console.log("ERROR:", err.message);
    } finally {
        process.exit(0);
    }
};

run();
