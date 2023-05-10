const { catchAsyncError } = require("../middlewares/catchAsyncError");

exports.contact = catchAsyncError(async(req, res) => {
    res.status(200).json({
        success: true,

    })
})