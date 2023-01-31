const express = require('express')
const route = express.Router()
const {authentication,authorization} = require('../middleware/authMiddleware')
const userCtrl = require('../controller/userController');
const bookCtrl = require('../controller/bookController');
const reviewCtrl = require('../controller/reviewController')

route.post("/creatLink",bookCtrl.createBookCover)

route.post('/register', userCtrl.createUser);
route.post('/login', userCtrl.loginUser);
//  BOOK api
route.post('/books',authentication,authorization,bookCtrl.bookCreate)
route.get('/books',authentication,bookCtrl.getBook)
route.get('/books/:bookId',authentication,bookCtrl.getBookId)
route.put('/books/:bookId',authentication,authorization,bookCtrl.updateBook)
route.delete('/books/:bookId',authentication,authorization,bookCtrl.bookDeleted)

// review api

route.post('/books/:bookId/review',reviewCtrl.createReview)

route.put('/books/:bookId/review/:reviewId',reviewCtrl.updateReview)
route.delete('/books/:bookId/review/:reviewId',reviewCtrl.deleteReview)

route.all('/*' ,(req,res)=>{
  res.status(400).send({status: false , message:"invalid path"})
})

module.exports= route