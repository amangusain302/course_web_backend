const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const { contact } = require('../controllers/otherController');
const router = express.Router();

//contact form
router.post("/contact", isAuthenticated, contact)

//request form 
router.post("/courserequest", isAuthenticated, contact)

module.exports = router;