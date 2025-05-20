const router = require('express').Router();
const {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks
} = require('../controllers/bookControllers');

router.get('/' ,  getBooks);
router.get('/:id' , getBookById);
router.get('/search', searchBooks);
router.post('/addBook' , createBook);
router.put('/updateBook/:id' , updateBook)
router.delete('/deleteBook/:id' , deleteBook)

module.exports = router;