const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');

// @route   GET /api/flashcards/:courseId
// @desc    Get flashcards for a course (or all if courseId='all')
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const query = (courseId === 'all') ? {} : { courseId };

        // If sorting by nextReviewDate is needed for study mode
        // const flashcards = await Flashcard.find(query).sort({ nextReviewDate: 1 });

        const flashcards = await Flashcard.find(query);
        const formatted = flashcards.map(f => ({
            id: f._id.toString(),
            courseId: f.courseId,
            userId: f.userId,
            front: f.front,
            back: f.back,
            nextReviewDate: f.nextReviewDate.getTime(),
            interval: f.interval,
            easeFactor: f.easeFactor,
            repetitions: f.repetitions
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/flashcards
// @desc    Create a new flashcard
router.post('/', async (req, res) => {
    try {
        const { userId, courseId, front, back } = req.body;

        const newCard = new Flashcard({
            userId,
            courseId,
            front,
            back
        });

        const card = await newCard.save();
        res.json({
            id: card._id.toString(),
            courseId: card.courseId,
            userId: card.userId,
            front: card.front,
            back: card.back,
            nextReviewDate: card.nextReviewDate.getTime(),
            interval: card.interval,
            easeFactor: card.easeFactor,
            repetitions: card.repetitions
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/flashcards/review/:id
// @desc    Process a review for a card (SM-2 Algorithm)
router.post('/review/:id', async (req, res) => {
    try {
        const { quality } = req.body; // 0-5
        if (quality === undefined) return res.status(400).json({ msg: "Quality rating required (0-5)" });

        const card = await Flashcard.findById(req.params.id);
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        // --- SM-2 Algorithm ---
        // Quality: 0=blackout, 1=wrong, 2=hard, 3=ok, 4=good, 5=perfect

        let { interval, repetitions, easeFactor } = card;

        if (quality >= 3) {
            // Correct response
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions += 1;
        } else {
            // Incorrect response
            repetitions = 0;
            interval = 1;
        }

        // Update Ease Factor
        // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q)*0.02))
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        // Calculate next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);

        // Update card
        card.interval = interval;
        card.repetitions = repetitions;
        card.easeFactor = easeFactor;
        card.nextReviewDate = nextDate;

        await card.save();

        res.json({
            id: card._id.toString(),
            nextReviewDate: card.nextReviewDate.getTime(),
            interval: card.interval
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard
router.delete('/:id', async (req, res) => {
    try {
        const card = await Flashcard.findById(req.params.id);
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        await card.deleteOne();
        res.json({ msg: 'Card removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
