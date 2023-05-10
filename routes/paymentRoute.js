const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const { buySubscription, paymentVerification, getRazorPayKey, cancelSubscription } = require('../controllers/paymentController');
const router = express.Router();

//Buy subscription 
router.get("/subscribe", isAuthenticated, buySubscription)
    //verify payment and reference in database
router.post("/paymentverification", isAuthenticated, paymentVerification)
    //Get razorpay key 
router.get("/razorpaykey", getRazorPayKey)

// cancel user subscription
router.delete("/subscribe/cancel", isAuthenticated, cancelSubscription)

module.exports = router;