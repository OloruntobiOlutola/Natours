const mongoose = require('mongoose')
const Tour = require('./tour-model')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "A review must have a review field"]
    },
    ratings: {
        type: Number,
        min: [1, "Rating can't be less than 1."],
        max: [5, "Rating can't be more than 5."],
        set: val => Math.round(val * 10) /10
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

reviewSchema.index({tourRef: 1, author: 1}, {unique: true})

reviewSchema.statics.calcAverageStats = async function(tourId){
    const stat = await this.aggregate([
        {$match: {tourRef: tourId}},
        {
            $group: {
                _id: '$tourRef',
                nRating: {$sum: 1},
                averageRating: {$avg: '$ratings'}
            }
        }
    ])
    if(stat.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stat[0].nRating,
            ratingsAverage: stat[0].averageRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        })
    }
}


reviewSchema.post('save', function(){
    this.constructor.calcAverageStats(this.tourRef)
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne().clone()
    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    //console.log(this.r.tourRef.id);
    await this.r.constructor.calcAverageStats(this.r.tourRef)
})

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