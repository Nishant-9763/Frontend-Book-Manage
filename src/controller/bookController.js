const userModel = require('../model/userModel')
const bookModel = require('../model/bookModel')
const reviewModel = require('../model/reviewModel')

const mongoose = require('mongoose')
const regex = /^[A-Za-z_? ]{3,30}$/
const isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
const dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/


// ===============================POST API CREATE BOOK ...........................

exports.bookCreate = async (req, res) => {
  try {

    let data = req.body
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data
    if (Object.keys(data).length = 0) return res.status(400).send({ status: false, message: "body empty" })

    if (!title || title.trim() == "") return res.status(400).send({ status: false, message: "title required" })
    if (!excerpt || excerpt.trim() == "") return res.status(400).send({ status: false, message: "excerpt required" })

    if (!ISBN || ISBN.trim() == "") return res.status(400).send({ status: false, message: "ISBN required" })
    if (!category || category.trim() == "") return res.status(400).send({ status: false, message: "category required" })
    if (!subcategory || subcategory.trim() == "") return res.status(400).send({ status: false, message: "subCategory required" })


    if (!title.match(regex)) return res.status(400).send({ status: false, message: "title invalid" })
    if (!excerpt.match(regex)) return res.status(400).send({ status: false, message: "excerpt invalid" })
    if (!category.match(regex)) return res.status(400).send({ status: false, message: "category invalid" })
    if (!subcategory.match(regex)) return res.status(400).send({ status: false, message: " subCategory invalid" })
    if (!ISBN.match(isbnRegex)) return res.status(400).send({ status: false, message: " ISBN invalid" })

    if (releasedAt) {
      if (!releasedAt.match(dateRegex)) return res.status(400).send({ status: false, message: " releasedAt invalid" })
    } else {
      data.releasedAt = new Date()
    }

    //  unique data 
    let findTitle = await bookModel.findOne({ title: title })
    if (findTitle) return res.status(400).send({ status: false, message: "title already exist in our data base" })
    let findIsbn = await bookModel.findOne({ ISBN: ISBN })
    if (findIsbn) return res.status(400).send({ status: false, message: "ISBN number already exist in our data base" })


    let crateBook = await bookModel.create(data)
    res.status(201).send({ status: true, message :"successful created",data: crateBook })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

// ===============================GET API  BOOK FIND BY FILTER ...........................


exports.getBook = async (req, res) => {
  try {
    let query = req.query
    const obj1 = { userId, category, subcategory, ...rest } = query;
    if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: 'please enter valid filter, userId, category and subcategory' });

    query.isDeleted = false;

    if (query.userId) {
      if (!mongoose.isValidObjectId(query.userId)) return res.status(400).send({ status: false, message: "id is not valid" })
    }

    let findBook = await bookModel.find(query).sort('title').select({ createdAt: 0, ISBN: 0, subcategory: 0, isDeleted: 0, updatedAt: 0, __v: 0 })
    if (findBook.length == 0) return res.status(404).send({ status: true,message :"successful get data ", message: "not match query" })
    res.status(200).send({ status: true, data: findBook })
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

// =============================== GET API  BOOK FIND BY ID ...........................

exports.getBookId = async (req, res) => {
  try {
    let id = req.params.bookId

    if (!mongoose.isValidObjectId(id)) return res.status(400).send({ status: false, message: "id is not valid" })

    let findData = await bookModel.findOne({ _id: id, isDeleted: false }).lean().select({ ISBN: 0, __v: 0 })
    if (!findData) return res.status(404).send({ status: false, message: "this bookId not exist in our data base" })
    let reviewFind = await reviewModel.find({ bookId: findData._id, isDeleted: false }).select({ isDeleted: 0, __v: 0 })
    findData.reviewsData = reviewFind
    res.status(200).send({ status: true, message :"successful book and review", data: findData })
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

// =============================== PUT  API  BOOK UPDATE ...........................

exports.updateBook = async (req, res) => {
  try {
    let id = req.params.bookId
    let body = req.body

    if (Object.keys(body).length == 0) return res.status(400).send({ status: false, message: 'please enter some details to update' });
    let { title, ISBN, excerpt, releasedAt, ...rest } = body

    if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: 'please enter valid details to update, title ,ISBN ,excerpt,releasedAt' });


    if (title || title == "") {
      if (!title.trim().match(regex)) return res.status(400).send({ status: false, message: "title invalid" })
    }

    if (excerpt || excerpt == "") { if (!excerpt.trim().match(regex)) return res.status(400).send({ status: false, message: "excerpt invalid" }) }
    if (ISBN || ISBN == "") { if (!ISBN.trim().match(isbnRegex)) return res.status(400).send({ status: false, message: " ISBN invalid" }) }
    if (releasedAt || releasedAt == "") { if (!releasedAt.trim().match(dateRegex)) return res.status(400).send({ status: false, message: " releasedAt invalid" }) }

    // UNIQUE  TITLE AND ISBN NUMBER 
    if (title) {
      let findTitle = await bookModel.findOne({ title: title })
      if (findTitle) return res.status(400).send({ status: false, message: "title already exist our data base" })
    }
    if (ISBN) {
      let findIsbn = await bookModel.findOne({ ISBN: ISBN })
      if (findIsbn) return res.status(400).send({ status: false, message: "ISBN number already exist our data base" })
    }
    //  NEW OBJECT FOR FIND AND UPDATE QUERY

    let findObj = { _id: id, isDeleted: false }
    let data = { title: title, excerpt: excerpt, ISBN: ISBN, releasedAt: releasedAt }
    // UPDATE OBJECT

    let updateBook = await bookModel.findOneAndUpdate(findObj, data, { new: true })
    if (!updateBook) return res.status(404).send({ status: false, message: "bookID not exist in our data base" })
    res.status(200).send({ status: true,message :"successful update", data: updateBook })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

// =============================== DELETED API  BOOK BY ID ...........................

exports.bookDeleted = async (req, res) => {
  try {
    let id = req.params.bookId

    let deletedBook = await bookModel.findOneAndUpdate({ _id: id, isDeleted: false },{isDeleted: true, deletedAt: new Date()}, { new: true });
    if (!deletedBook) return res.status(404).send({ status: false, message: "bookId is not exist in our data base" });
    res.status(200).send({ status: false, message:"successful Deleted" })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

