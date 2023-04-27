const express = require('express');
const { register, login, logout, getMyProfile, changePassword, updateProfile, updateProfilePicture, forgetPassword, resetPassword } = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isAuthenticated, getMyProfile);
router.put('/changepassword', isAuthenticated, changePassword);
router.put('/updateprofile', isAuthenticated, updateProfile);
router.put('/updateprofilepicture', isAuthenticated, updateProfilePicture);
router.post('/forgetpassword', forgetPassword);
router.put('/resetpassword/:token', resetPassword);


module.exports = router;