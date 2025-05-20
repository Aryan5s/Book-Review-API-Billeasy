const Review = require('../models/reviewModal');
const Book = require('../models/bookModel');

// Controller to create a new review for a book
const createReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id; // This will be setup in the authentication middleware
        const { rating, comment } = req.body;

        // Validate rating input (must be between 1 and 5)
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating is required and must be between 1 and 5'
            });
        }
        
        // Check if the book exists before adding a review
        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({
                status: 'error',
                message: `No book exists with id: ${bookId}`
            });
        }

        // Prevent users from adding multiple reviews for the same book
        const existingReview = await Review.findOne({
            where: {
                userId: userId,
                bookId: bookId
            }
        });

        if (existingReview) {
            return res.status(400).json({
                status: 'error',
                message: 'You have already reviewed this book. Please update your existing review instead.'
            });
        }

        // Create and save the new review in the database
        const newReview = await Review.create({
            userId,
            bookId,
            rating,
            comment
        });

        return res.status(201).json({
            status: 'success',
            message: 'Review submitted successfully',
            review: newReview
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: `Internal server error: ${error.message}`
        });
    }
};

// Controller to update an existing review
const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id; // This will be setup in the authentication middleware
        const { rating, comment } = req.body;

        // Validate rating input (must be between 1 and 5)
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating is required and must be between 1 and 5'
            });
        }

        // Find the review by ID
        const review = await Review.findByPk(reviewId);
        
        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: `No review found with id: ${reviewId}`
            });
        }

        // Ensure the review belongs to the authenticated user before updating
        if (review.userId !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only update your own reviews'
            });
        }

        // Update the review in the database
        await review.update({
            rating,
            comment
        });

        return res.status(200).json({
            status: 'success',
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: `Internal server error: ${error.message}`
        });
    }
};

// Controller to delete a review
const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id; // This will be setup in the authentication middleware

        // Find the review by ID
        const review = await Review.findByPk(reviewId);
        
        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: `No review found with id: ${reviewId}`
            });
        }

        // Ensure the review belongs to the authenticated user before deleting
        if (review.userId !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only delete your own reviews'
            });
        }

        // Delete the review from the database
        await review.destroy();

        return res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: `Internal server error: ${error.message}`
        });
    }
};

module.exports = {
    createReview,
    updateReview,
    deleteReview
};
