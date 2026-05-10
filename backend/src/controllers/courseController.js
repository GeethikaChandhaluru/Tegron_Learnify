const Course = require("../models/Course");

// ➕ Add Course
const addCourse = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        if (!title || !description || !price) {
            return res.status(400).json({ message: "All fields required" });
        }

        const course = await Course.create({ title, description, price });

        res.status(201).json({ message: "Course added", course });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// 📥 Get Courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching" });
    }
};

// ❌ Delete Course
const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

module.exports = { addCourse, getCourses, deleteCourse };