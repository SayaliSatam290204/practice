const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
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
} = require('../controllers/userController');

    router.put('/profile', protect, updateUserProfile);
    router.post('/addresses', protect, addAddress);
    router.put('/addresses/:id', protect, editAddress);
    router.delete('/addresses/:id', protect, deleteAddress);
    router.put('/addresses/:id/default', protect, setDefaultAddress);
    
    router.post('/createUser', protect, adminOnly, createUser);
    router.post('/createAdmin', protect, adminOnly, createAdmin);
    router.get('/getAllAdmin', protect, adminOnly, getAllAdmin);
    router.get('/getAllUsers', protect, adminOnly, getAllUsers);
    router.get('/getActiveAdmins', protect, adminOnly, getActiveAdmins);
    router.get('/getActiveNormalUsers', protect, adminOnly, getActiveNormalUsers);
    router.get('/check-admin-exists', checkAdminExists);
    router.put('/update-user-role/:id', protect, adminOnly, updateUserRole);
    router.delete('/delete-user/:id', protect, adminOnly, deleteUser);

    module.exports = router;