const express = require('express');
const { register, login, logout, getMyProfile, changePassword, updateProfile, updateProfilePicture, forgetPassword, resetPassword, addToPlaylist, removeFromPlaylist, getAllUsers, updateUserRole, deleteUser, deleteMyProfile } = require('../controllers/userController');
const { isAuthenticated, authorizeAdmin } = require('../middlewares/auth');
const singleUpload = require('../middlewares/multer');
const router = express.Router()

router.post('/register', singleUpload, register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isAuthenticated, getMyProfile);
router.delete('/me', isAuthenticated, deleteMyProfile);
router.put('/changepassword', isAuthenticated, changePassword);
router.put('/updateprofile', isAuthenticated, updateProfile);
router.put('/updateprofilepicture', isAuthenticated, singleUpload, updateProfilePicture);
router.post('/forgetpassword', forgetPassword);
router.put('/resetpassword/:token', resetPassword);
router.post('/addtoplaylist', isAuthenticated, addToPlaylist);
router.delete('/removefromplaylist', isAuthenticated, removeFromPlaylist);

//admin routes
router.get('/admin/users', isAuthenticated, authorizeAdmin, getAllUsers);
router.put('/admin/users/:id', isAuthenticated, authorizeAdmin, updateUserRole)
    .delete('/admin/users/:id', isAuthenticated, authorizeAdmin, deleteUser)



module.exports = router;