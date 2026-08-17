const User = require('../models/User');

//create user
//API: POST /api/users/create-user
const createUser = async(req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body;

        if (!name || !email || !password || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                message: 'All user fields are required'
            });
        }

        const hashedPassword = await require('bcryptjs').hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            pincode,
            role: 'user'
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//create admin user
//API: POST /api/users/create-admin
const createAdmin = async(req,res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body;

        if (!name || !email || !password || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                message: 'All admin fields are required'
            });
        }

        const hashedPassword = await require('bcryptjs').hash(password, 10);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            pincode,
            role: 'admin'
        });

        const adminResponse = admin.toObject();
        delete adminResponse.password;

        res.status(201).json({message: 'Admin user created successfully', admin: adminResponse});
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//find all admin
//API: GET /api/users/admin
const getAllAdmin = async(req, res) => {
    try{
        const admins = await User.find({role: 'admin'}).select('-password');
        res.status(200).json(admins);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//Find all normal users
//API: GET /api/users/users
const getAllUsers = async(req, res) => {
    try{
        const users = await User.find({role: 'user'}).select('-password');
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: error.message})
    }
};

//Find Active admins
//API: GET /api/users/active-admins
const getActiveAdmins = async(req, res) => {
    try{
        const activeAdmins = await User.find({role: 'admin', active: true}).select('-password');
        res.status(200).json(activeAdmins);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//Find all active normal users
//API: GET /api/users/active-users
const getActiveNormalUsers = async(req, res) => {
    try{
        const activeUsers = await User.find({role: 'user', active: true}).select('-password');
        res.status(200).json(activeUsers);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//check whether admin exists 
//API: GET /api/users/check-admin-exists
const checkAdminExists = async(req, res) => {
    try{
        const adminExists = await User.exists({role: 'admin'});
        res.status(200).json({adminExists : !! adminExists});
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//update user role (user -> admin)
//API: PUT /api/users/update-user-role/:id
const updateUserRole = async(req, res) => {
    try{
        const updateUser = await User.findByIdAndUpdate(
            req.params.id, 
            {role: 'admin'},
            {new: true}
        );
        if(!updateUser){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({message: 'User role updated successfully', updateUser});
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

//Delete User
//API: DELETE /api/users/delete-user/:id
const deleteUser = async(req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({message: 'User deleted successfully'});
    }catch(error){
        res.status(500).json({message: error.message});
    }
};



// Update User Profile (Self)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                token: req.headers.authorization.split(' ')[1] // Keep existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Address
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const newAddress = req.body;
            if (newAddress.isDefault) {
                user.addresses.forEach(addr => addr.isDefault = false);
            }
            if (user.addresses.length === 0) {
                newAddress.isDefault = true;
            }
            user.addresses.push(newAddress);
            await user.save();
            res.status(201).json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Address
const editAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const addressId = req.params.id;
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
            
            if (addressIndex !== -1) {
                if (req.body.isDefault) {
                    user.addresses.forEach(addr => addr.isDefault = false);
                }
                user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...req.body };
                await user.save();
                res.json(user.addresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Address
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const addressId = req.params.id;
            const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
            
            if (addressIndex !== -1) {
                const wasDefault = user.addresses[addressIndex].isDefault;
                user.addresses.splice(addressIndex, 1);
                
                if (wasDefault && user.addresses.length > 0) {
                    user.addresses[0].isDefault = true;
                }
                await user.save();
                res.json(user.addresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set Default Address
const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const addressId = req.params.id;
            const addressExists = user.addresses.some(addr => addr._id.toString() === addressId);
            
            if (addressExists) {
                user.addresses.forEach(addr => {
                    addr.isDefault = addr._id.toString() === addressId;
                });
                await user.save();
                res.json(user.addresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser, 
    createAdmin, 
    getAllAdmin, 
    getAllUsers, 
    getActiveAdmins, 
    getActiveNormalUsers, 
    checkAdminExists, 
    updateUserRole, 
    deleteUser,
    updateUserProfile,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress
};