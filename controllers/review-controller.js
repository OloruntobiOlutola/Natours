const Review = require("../models/review-model");
const APIFeatures = require("../utils/apiFeatures");
const handlerController = require('./handlerFactory')
const catchAsync = require("../utils/catchAsync");

exports.getAllReview = catchAsync(async (req, res, next) => {
    let filter = req.params.tourId ? {tourRef:req.params.tourId} : {}
    const features = new APIFeatures(Review.find(filter), req.query).sort().limit().filter().paginate()
    
    const reviews = await features.query

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})

exports.createReview = catchAsync (async (req, res, next) => {
    if (!req.body.tourRef) req.body.tourRef = req.params.tourId
    if(!req.body.author) req.body.author = req.user.id;
    const review = await Review.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            review
        }
    })
})

exports.deleteReview = handlerController.deleteOne(Review)

exports.updateReview = handlerController.updateOne(Review)