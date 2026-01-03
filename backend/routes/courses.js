const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// @route   GET /api/courses
// @desc    Get all courses for user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "UserId is required" });

        const courses = await Course.find({ userId }).sort({ createdAt: -1 });
        // Format for frontend
        const formatted = courses.map(c => ({
            id: c._id.toString(),
            name: c.name,
            color: c.color,
            userId: c.userId,
            createdAt: c.createdAt
        }));
        res.json({ courses: formatted });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses
// @desc    Create a new course
router.post('/', async (req, res) => {
    try {
        const { userId, name, color } = req.body;
        if (!userId || !name) return res.status(400).json({ message: "Missing fields" });

        const newCourse = new Course({
            userId,
            name,
            color
        });

        const course = await newCourse.save();
        res.json({
            id: course._id.toString(),
            name: course.name,
            color: course.color,
            userId: course.userId,
            createdAt: course.createdAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        await course.deleteOne();
        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
