const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "A review must have a review field"]
    },
    ratings: {
        type: Number,
        min: [1, "Rating can't be less than 1."],
        max: [5, "Rating can't be more than 5."],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    tourRef: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "A review must belong to a tour"]
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "A review must belong to an author"]
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'tourRef',
        select: 'name'
    }).populate({
        path: 'author',
        select: 'name photo'
    })
    next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review