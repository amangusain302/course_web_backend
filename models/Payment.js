const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    razorpay_signature: {
        type: String,
        require: true
    },
    razorpay_payment_id: {
        type: String,
        require: true
    },
    razorpay_subscription_id: {
        type: String,
        require: true
    }   
}, { timestamps: true })

const PaymentModel = new mongoose.model("Payment", schema);

module.exports = PaymentModel;