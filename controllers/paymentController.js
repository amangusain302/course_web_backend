const { instance } = require("../app");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const Payment = require("../models/Payment");
const crypto = require("crypto");

exports.buySubscription = catchAsyncError(async(req, res, next) => {
    var user = await User.findById(req.user._id);
    if (user.role === 'admin') return next(new ErrorHandler("Admin can't buy subscripiton", 400));

    const plan_id = process.env.PLAN_ID;
    const subscription = await instance.subscriptions.create({
        plan_id: plan_id,
        customer_notify: 1,
        total_count: 12
    });
    // console.log(subscription)
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status
        // console.log(subscription.id)

    await user.save()
    res.status(201).json({
        success: true,
        subscriptionId: subscription.id
    })
})


exports.paymentVerification = catchAsyncError(async(req, res, next) => {

    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body
    var user = await User.findById(req.user._id);


    const subscripiton_id = user.subscripiton_id;
    const generated_singature = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(razorpay_payment_id + "|" + subscripiton_id, "utf-8").digest("hex");

    const isAuthentic = generated_singature === razorpay_signature;

    if (!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);

    //database comes
    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    });

    user.subscription.status = "active";

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`);

});

exports.getRazorPayKey = catchAsyncError(async(req, res, next) => {
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_ID,
    })
})



exports.cancelSubscription = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user._id);

    const subscripitonId = user.subscription.id;

    let refund = false;

    await instance.subscription.cancel(subscripitonId);

    const payment = await Payment.findOne({ razorpay_subscription_id: subscripitonId, });

    const gap = Date.now() - payment.createdAt;

    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if (refundTime > gap) {
        // await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;
    }
    await payment.remove();
    user.subscription.id = undefined;
    user.subscripition.status = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: refund ?
            "Subscription cancelled, you will get full refund within 7 days" : "Subscription cancelled, Now refund initiated as subscription was cancelled after 7 days."
    })
})