const { Sequelize, DataTypes } = require('sequelize');
const Book = require('../models/bookModel');
const Review = require('../models/reviewModal');

// Controller to get all the books available in the system
const getBooks = async (req, res) => {
    try {
        // Extract filter parameters from query string
        const { title, author, genre } = req.query;
        
        // Extract pagination parameters from query string (not body)
        // Default to page 1 with 10 items per page if not specified
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Calculate offset based on page and limit
        const offset = (page - 1) * limit;
        
        // Prepare the where clause for filtering
        let whereClause = {};
        
        // Add conditions to where clause based on provided filters
        if (title) whereClause.title = { [Op.iLike]: `%${title}%` };
        if (author) whereClause.author = { [Op.iLike]: `%${author}%` };
        if (genre) whereClause.genre = genre;
        
        // Fetch books with pagination and filter
        const result = await Book.findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: [['title', 'ASC']]
        });
        
        // Calculate total pages based on count and limit
        const totalPages = Math.ceil(result.count / limit);
        
        // Return formatted response with pagination metadata
        return res.status(200).json({
            status: 'success',
            totalBooks: result.count,
            totalPages: totalPages,
            currentPage: page,
            booksPerPage: limit,
            data: result.rows
        });
    } catch (error) {
        console.log(error);
        // Return appropriate error response
        return res.status(500).json({
            status: 'error',
            message: `Internal server error: ${error.message}`
        });
    }
};

// Controller to get a single book by ID, including reviews and average rating
const getBookById = async (req, res) => {
    try {
        // Extract book ID from the request parameters
        const bookId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Find the book by primary key (ID)
        const book = await Book.findByPk(bookId);

        // If the book is not found, return a 404 response
        if (!book) {
            return res.status(404).json({
                status: 'error',
                message: `No Book available with Id: ${bookId}`
            });
        }

        // Fetch the book's reviews with pagination
        const reviews = await Review.findAndCountAll({
            where: { bookId: bookId },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        // Calculate the average rating of the book
        const averageRating = await Review.findOne({
            where: { bookId: bookId },
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']
            ],
            raw: true
        });

        // Return the book details along with reviews and average rating
        return res.status(200).json({
            status: 'Success',
            book,
            averageRating: averageRating.averageRating ? parseFloat(averageRating.averageRating).toFixed(1) : 0,
            reviews: {
                totalReviews: reviews.count,
                totalPages: Math.ceil(reviews.count / limit),
                currentPage: page,
                data: reviews.rows
            }
        });
    } catch (error) {
        console.log(error);
        // Return error response in case of exception
        return res.status(500).json({
            status: 'error',
            message: `Internal server error: ${error.message}`
        });
    }
};

// Controller to create a new book in the system
const createBook = async (req, res) => {
    try {
        // Extract book details from the request body
        const { id, title, author, genre, publication_year, ISBN } = req.body;
        
        // Validate required fields
        if (!id || !title || !author || !genre || !publication_year || !ISBN) {
            return res.status(400).json({
                status: "error",
                message: "Please enter all fields",
            });
        }

        // Create a new book record
        const newBook = await Book.create({
            id,
            title,
            author,
            genre,
            publication_year,
            ISBN,
        });

        // Return success response with the newly created book details
        res.status(201).json({ message: 'Book inserted successfully', book: newBook });

    } catch (error) {
        console.log(error);
        // Return error response in case of exception
        return res.status(400).json({
            message : `Internal server error : ${error.message}`
        });
    }
}

// Controller to update book details by ID
const updateBook = async (req, res) => {
    try {
        // Extract book ID from the request parameters
        const bookId = req.params.id;
        const { title, author, genre, publication_year, ISBN } = req.body;

        // Validate required fields
        if (!title || !author || !genre || !publication_year || !ISBN) {
            return res.status(204).json({
                status : 'Failed',
                message : 'Some fields are missing, Please Check again'
            });
        }

        // Update the book record with new details
        const updatedBook = await Book.update({
            title,
            author,
            genre,
            publication_year,
            ISBN
        }, { where: { id: bookId } });

        // Return success response with the updated book details
        res.status(200).json({
            status : 'success',
            message : 'Book Successfully updated',
            updatedBook
        });

    } catch (error) {
        console.log(error);
        // Return error response in case of exception
        return res.status(400).json({
            message : `Internal server error : ${error.message}`
        });
    }
}

// Controller to delete a book by ID
const deleteBook = async (req, res) => {
    try {
        // Extract book ID from the request parameters
        const bookId = req.params.id;

        // Find the book by ID before attempting to delete
        const book = await Book.findByPk(bookId);

        // If the book does not exist, return a 204 response
        if (!book) return res.status(204).json({ status: 'success', message: `No book exists with id : ${bookId}` });

        // Delete the book record from the database
        const deletedBook = await Book.destroy({ where: { id: bookId } });

        // Return success response after deletion
        return res.status(200).json({
            status: 'Success',
            message: `Successfully deleted ${deletedBook} book`
        });
    } catch (error) {
        console.log(error);
        // Return error response in case of exception
        return res.status(400).json({
            message : `Internal server error : ${error.message}`
        });
    }
}

// Controller to search for books by title or author
const searchBooks = async (req, res) => {
    try {
        // Extract search query from the request query parameters
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Validate that a search query is provided
        if (!query) {
            return res.status(400).json({
                status: 'error',
                message: 'Search query parameter is required'
            });
        }

        // Perform the search using partial matching on title and author
        const books = await Book.findAndCountAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${query}%` } },
                    { author: { [Op.iLike]: `%${query}%` } }
                ]
            },
            limit,
            offset,
            order: [['title', 'ASC']]
        });

        // Return search results with pagination
        return res.status(200).json({
            status: 'Success',
            totalBooks: books.count,
            totalPages: Math.ceil(books.count / limit),
            currentPage: page,
            data: books.rows
        });
    } catch (error) {
        console.log(error);
        // Return error response in case of exception
        return res.status(500).json({
            status: 'error',
            message: `Internal server error: ${error.message}`
        });
    }
};

module.exports = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks
}
