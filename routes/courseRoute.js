const express = require('express');
const router = express.Router()
const { getAllCourse, createCourse } = require('../controllers/courseController');

router.get('/courses', getAllCourse);
router.post('/createcourse', createCourse);
// router.get('/course/:id', getCourseLectures);

module.exports = router;