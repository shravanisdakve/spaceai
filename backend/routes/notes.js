const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// @route   GET /api/notes/:courseId
// @desc    Get notes for a course
router.get('/:courseId', async (req, res) => {
    try {
        const notes = await Note.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
        const formatted = notes.map(n => ({
            id: n._id.toString(),
            courseId: n.courseId.toString(),
            userId: n.userId,
            title: n.title,
            content: n.content,
            type: n.type,
            fileUrl: n.fileUrl,
            fileName: n.fileName,
            fileType: n.fileType,
            createdAt: n.createdAt.getTime() // Frontend expects number timestamp
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/notes
// @desc    Create a new note
router.post('/', async (req, res) => {
    try {
        const { userId, courseId, title, content, type, fileUrl, fileName, fileType } = req.body;

        const newNote = new Note({
            userId,
            courseId,
            title,
            content,
            type,
            fileUrl,
            fileName,
            fileType
        });

        const note = await newNote.save();
        res.json({
            id: note._id.toString(),
            courseId: note.courseId.toString(),
            userId: note.userId,
            title: note.title,
            content: note.content,
            type: note.type,
            fileUrl: note.fileUrl,
            fileName: note.fileName,
            fileType: note.fileType,
            createdAt: note.createdAt.getTime()
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notes/:id
// @desc    Update note content
router.put('/:id', async (req, res) => {
    try {
        const { content } = req.body;
        let note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ msg: 'Note not found' });

        note.content = content;
        await note.save();

        res.json({
            id: note._id.toString(),
            content: note.content
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ msg: 'Note not found' });

        await note.deleteOne();
        res.json({ msg: 'Note removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
