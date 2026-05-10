const Course = require("../models/Course");

// ➕ Add Course
const addCourse = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        // basic validation
        if (!title || !description || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const course = await Course.create({
            title,
            description,
            price,
        });

        res.status(201).json({
            message: "Course added successfully",
            course,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// 📥 Get All Courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { addCourse, getCourses };