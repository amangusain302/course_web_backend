const jwt = require('jsonwebtoken');
const { catchAsyncError } = require('./catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');


exports.isAuthenticated = catchAsyncError(async(req, res, next) => {
    const { token } = req.cookies;
    if (!token) return next(new ErrorHandler("Not logged In", 401))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded._id);
    next();
});