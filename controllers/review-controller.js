const Review = require("../models/review-model");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getAllReview = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Review.find(), req.query).sort().limit().filter().paginate()
    
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
    const review = await Review.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            review
        }
    })
})