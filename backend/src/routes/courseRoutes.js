const express = require("express");
const router = express.Router();

const {
    addCourse,
    getCourses,
} = require("../controllers/courseController");

// ➕ Add Course
router.post("/add", addCourse);

// 📥 Get All Courses
router.get("/", getCourses);

module.exports = router;