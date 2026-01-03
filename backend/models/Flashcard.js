const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    courseId: {
        type: String, // Can be course ID or "general"
        required: true,
        index: true
    },
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    },
    // Spaced Repetition Fields (SM-2)
    nextReviewDate: {
        type: Date,
        default: Date.now
    },
    interval: {
        type: Number,
        default: 0 // Days
    },
    easeFactor: {
        type: Number,
        default: 2.5
    },
    repetitions: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
