const { catchAsyncError } = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');
const { sendToken } = require('../utils/sendToken');
const { sendEmail } = require('../utils/sendEmail');
const getDataUri = require('../utils/getDataUri');
const cloudinary = require('cloudinary');
const Stats = require('../models/Stats');


exports.register = catchAsyncError(async(req, res, next) => {

    const { name, email, password } = req.body;
    const file = req.file;


    if (!name || !email || !password || !file)
        return next(new ErrorHandler("Please enter all field", 400));

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exist", 409));

    //Upload file on clodinary;

    // console.log(file)
    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);


    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        }
    });

    sendToken(res, user, "Registered Successfully", 201)
})



exports.login = catchAsyncError(async(req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password)
        return next(new ErrorHandler("Please enter all field", 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user) return next(new ErrorHandler("Incorrect Email and Password", 401));

    //Upload file on clodinary;
    const isMatch = await user.comparePassword(password);

    if (!isMatch) return next(new ErrorHandler("Incorrect Email and Password", 401));

    sendToken(res, user, `Welcome Back ${user.name}`, 200)
    // res.status(200).cookie("token", "ksjfsakjjskjak", {
    //     maxAge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    //     httpOnly: true,
    // }).json({
    //     success: true,
    //     message : "login successfuly",
    //     user
    // })
}   )



exports.getMyProfile = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user._id)
    // console.log(user)
    res.status(200).json({
        success: true,
        user
    })
})

exports.deleteMyProfile = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne();
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: 'User deleted successfully'
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

    await user.save().catch(err => {
        if(err.code === 11000){
            return next(new ErrorHandler("Email is already exist", 409));
        }
        return next(new ErrorHandler(err.message, 500));
    })

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully"
    })
})


exports.updateProfilePicture = catchAsyncError(async(req, res, next) => {

    // CLOUDINAR
    const user = await User.findById(req.user._id);
    const file = req.file;
    console.log(file)
    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url
    }

    await user.save();

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
    console.log(resetToken)

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

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });
    if (!user){
        return next(new ErrorHandler("Token is Invaild or has been expired", 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
})

exports.addToPlaylist = catchAsyncError(async(req, res, next) => {
    // console.log('adsfaf')
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);
    if (!course) return next(new ErrorHandler('Invalid Course Id', 404));
    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) return true;
    })
    if (itemExist) return next(new ErrorHandler('Item Already Exist', 409))
    user.playlist.push({
        course: course._id,
        poster: course.poster.url,
    })

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist "
    })
})

exports.removeFromPlaylist = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);
    if (!course) return next(new ErrorHandler('Invalid Course Id', 404));
    const newPlaylist = user.playlist.filter(item => {
        if (item.course.toString() !== course._id.toString()) return item;
    })

    user.playlist = newPlaylist;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Removed from playlist "
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

exports.getAllUsers = catchAsyncError(async(req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        success: true,
        users
    })
})

exports.updateUserRole = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User Not Found", 404))
    if (user.role === "user") user.role = "admin"
    else user.role = "user"
    await user.save();
    res.status(200).json({
        success: true,
        message: `Role Updated to ${user.role} Successfully`
    })
})

exports.deleteUser = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User Not Found", 404))
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    })
})

User.watch().on("change", async() => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    const subscription = await User.find({ "subscription.status": "active" });

    stats[0].users = await User.countDocuments();
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
})