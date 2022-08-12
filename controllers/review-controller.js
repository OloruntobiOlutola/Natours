const Review = require("../models/review-model");
const APIFeatures = require("../utils/apiFeatures");
const handlerController = require('./handlerFactory')
const catchAsync = require("../utils/catchAsync");


exports.setUserAndToursIds = (req, res, next) => {
    if (!req.body.tourRef) req.body.tourRef = req.params.tourId
    if(!req.body.author) req.body.author = req.user.id;
    next()
}

exports.getAllReview = handlerController.getAll(Review)

exports.getReview = handlerController.getOne(Review)

exports.createReview = handlerController.createOne(Review)

exports.deleteReview = handlerController.deleteOne(Review)

exports.updateReview = handlerController.updateOne(Review)