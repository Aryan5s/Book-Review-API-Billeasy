const router = require('express').Router();
const {
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewControllers');

// Review routes
router.post('/books/:id/reviews',  createReview);
router.put('/reviews/:id',  updateReview);
router.delete('/reviews/:id',  deleteReview);

module.exports = router;