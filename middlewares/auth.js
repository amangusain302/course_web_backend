const jwt = require('jsonwebtoken');
const { catchAsyncError } = require('./catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');


exports.isAuthenticated = catchAsyncError(async(req, res, next) => {
    const { token } = req.cookies;
    if (!token) return next(new ErrorHandler("Not logged In", 401))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("auth")

    req.user = await User.findById(decoded._id);
    next();
});

exports.authorizeAdmin = (req, res, next) => {

    if (req.user.role !== 'admin') return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource.`, 403));

    next();
};

exports.authorizeSubscribers = (req, res, next) => {

    if (req.user.subscription.status !== 'active' && req.user.role !== "admin") return next(new ErrorHandler(`Only subscriber can access this resource.`, 403));

    next();
};