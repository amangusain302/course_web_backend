const express = require('express');
const { isAuthenticated, authorizeAdmin } = require('../middlewares/auth');
const { contact, courseRequest, getDashboardStats } = require('../controllers/otherController');
const router = express.Router();

//contact form
router.post("/contact", contact)

//request form 
router.post("/courserequest", courseRequest);


//get admin Dashboard stats 
router.get("/admin/stats", isAuthenticated, authorizeAdmin, getDashboardStats);


module.exports = router;