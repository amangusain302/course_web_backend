const { catchAsyncError } = require('../middlewares/catchAsyncError');
const courseModel = require('../models/Course');
const ErrorHandler = require('../utils/errorHandler');

//get all courses
exports.getAllCourse = catchAsyncError(async(req, res, next) => {
    const courses = await courseModel.find().select('-lectures');
    res.status(200).json({
        success: true,
        courses
    });
})

//create course
exports.createCourse = catchAsyncError(async(req, res, next) => {
    console.log(req.body)

    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy)
        return next(new ErrorHandler("Please Add all fields", 400));

    // const file = req.file;

    await courseModel.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: "temp",
            url: "temp"
        }
    })
    res.status(201).json({
        success: true,
        message: "Coures created successfully. You can add lectures now. "
    });
})



//add lecture, delete lecture, get course lecture