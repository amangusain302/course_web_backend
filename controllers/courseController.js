const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Course = require('../models/Course');
const ErrorHandler = require('../utils/errorHandler');
const getDataUri = require('../utils/getDataUri');
const cloudinary = require('cloudinary')
    //get all courses
exports.getAllCourse = catchAsyncError(async(req, res, next) => {
    const courses = await Course.find().select('-lectures');
    res.status(200).json({
        success: true,
        courses
    });
})

//create course
exports.createCourse = catchAsyncError(async(req, res, next) => {
    // console.log(req.body)

    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy)
        return next(new ErrorHandler("Please Add all fields", 400));

    const file = req.file;
    // console.log(file)
    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    })
    res.status(201).json({
        success: true,
        message: "Coures created successfully. You can add lectures now. "
    });
})



//add lecture, delete lecture, get course lecture

exports.getCourseLectures = catchAsyncError(async(req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) return next(new ErrorHandler('Course not found', 404));

    course.views += 1;
    await course.save()
    res.status(200).json({
        success: true,
        lectures: course.lectures
    })
})


//max video size 100mb
exports.addLecture = catchAsyncError(async(req, res, next) => {

    const { id } = req.params;
    const { title, description } = req.body;
    const file = req.file;

    if (!file || !title || !description) return next(new ErrorHandler("Please provide all fields", 400))
    const course = await Course.findById(id);
    if (!course) return next(new ErrorHandler('Course not found', 404));

    const fileUri = getDataUri(file);

    //upload file here  
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: 'video',
    });
    course.lectures.push({
        title,
        description,
        video: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        },
    });

    course.numOfVideos = course.lectures.length;

    await course.save()
    res.status(200).json({
        success: true,
        message: "Lecture Added in Course Successfully"
    })
})

exports.deleteCourse = catchAsyncError(async(req, res, next) => {
    // console.log(req.body)
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) return next(new ErrorHandler('Course not found', 404));
    await cloudinary.v2.uploader.destroy(course.poster.public_id)

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i];
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
            resource_type: "video",
        });
    }

    await course.deleteOne();
    res.status(200).json({
        success: true,
        message: "Course deleted succesfully"
    });
})

exports.deleteLecture = catchAsyncError(async(req, res, next) => {
    // console.log(req.body)
    const { courseId, lectureId } = req.query;
    const course = await Course.findById(courseId);

    if (!course) return next(new ErrorHandler('Course not found', 404));
    const lecture = course.lectures.find(item => {
        if (item._id.toString() === lectureId.toString()) return item;
    })

    course.lectures = course.lectures.filter(item => {
        if (item._id.toString() !== lectureId.toString()) return item;
    })

    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
        resource_type: "video",
    });
    course.numOfVideos = course.lectures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture Deleted Successfully"
    });
})