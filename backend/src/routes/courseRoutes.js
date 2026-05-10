const express = require("express");
const router = express.Router();

const {
    addCourse,
    getCourses,
    deleteCourse,
} = require("../controllers/courseController");

router.post("/add", addCourse);
router.get("/", getCourses);
router.delete("/:id", deleteCourse);

module.exports = router;