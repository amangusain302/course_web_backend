const express = require('express');
const router = express.Router()
const { getAllCourse, createCourse, getCourseLectures, addLecture, deleteCourse, deleteLecture } = require('../controllers/courseController');
const singleUpload = require('../middlewares/multer');
const { authorizeAdmin, isAuthenticated, authorizeSubscribers } = require('../middlewares/auth');


router.get('/courses', getAllCourse);
router.post('/createcourse', isAuthenticated, authorizeAdmin, singleUpload, createCourse);
router.get('/course/:id', isAuthenticated, authorizeSubscribers, getCourseLectures)
    .post('/course/:id', isAuthenticated, authorizeAdmin, singleUpload, addLecture)
    .delete('/course/:id', isAuthenticated, authorizeAdmin, deleteCourse);
router.delete('/lecture', isAuthenticated, authorizeAdmin, deleteLecture);

module.exports = router;