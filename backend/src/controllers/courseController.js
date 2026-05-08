const Course = require("../models/Course");

const addCourse = async (req, res) => {
    const course = await Course.create(req.body);
    res.json(course);
};

const getCourses = async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
};

module.exports = { addCourse, getCourses };