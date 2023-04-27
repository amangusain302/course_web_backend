const { catchAsyncError } = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const crypto = require('crypto');
const { sendToken } = require('../utils/sendToken');
const { sendEmail } = require('../utils/sendEmail');

exports.register = catchAsyncError(async(req, res, next) => {

    const { name, email, password } = req.body;

    // const file = req.file;

    if (!name || !email || !password)
        return next(new ErrorHandler("Please enter all field", 400));

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exist", 409));

    //Upload file on clodinary;


    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "tempUrl",
            url: "tempurl"
        }
    });

    sendToken(res, user, "Registered Successfully", 201)
})



exports.login = catchAsyncError(async(req, res, next) => {

    const { email, password } = req.body;

    // const file = req.file;

    if (!email || !password)
        return next(new ErrorHandler("Please enter all field", 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user) return next(new ErrorHandler("Incorrect Email and Password", 401));

    //Upload file on clodinary;
    const isMatch = await user.comparePassword(password);

    if (!isMatch) return next(new ErrorHandler("Incorrect Email and Password", 401));

    sendToken(res, user, `Welcome Back ${user.name}`, 200)
})



exports.getMyProfile = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user._id)
    res.status(200).json({
        success: true,
        user
    })
})


exports.changePassword = catchAsyncError(async(req, res, next) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword)
        return next(new ErrorHandler("Please enter all field", 400));

    const user = await User.findById(req.user._id).select("+password")

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch)
        return next(new ErrorHandler("Incorrect old password", 400));

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
})


exports.updateProfile = catchAsyncError(async(req, res, next) => {
    const { name, email } = req.body

    const user = await User.findById(req.user._id)
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully"
    })
})


exports.updateProfilePicture = catchAsyncError(async(req, res, next) => {

    // CLOUDINARY
    res.status(200).json({
        success: true,
        message: "Profile Picture Updated Successfully"
    })
})


exports.forgetPassword = catchAsyncError(async(req, res, next) => {
    const { email } = req.body
    if (!email)
        return next(new ErrorHandler("Please Provide Email", 400));

    const user = await User.findOne({ email });
    if (!user)
        return next(new ErrorHandler("User not Found", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    const message = `Click on the link to reset your password ${url}. If you have not request so please ignore`

    await sendEmail(user.email, "CourseWeb Reset Password", message)
        //send token via email

    res.status(200).json({
        success: true,
        message: `Reset Token has been sent to ${user.email}`
    });
});

exports.resetPassword = catchAsyncError(async(req, res, next) => {
    const token = req.params.token

    resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });
    if (!user)
        return next(new ErrorHandler("Token is Invaild or has been expired", 400))

    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
})


exports.logout = catchAsyncError(async(req, res, next) => {
    const options = {
        expires: new Date(Date.now()),
        httpOnly: true,
        // secure: true,
        sameSite: "none"
    }
    res.status(200).cookie('token', null, options).json({
        success: true,
        message: "logged Out Successfully"
    })
})