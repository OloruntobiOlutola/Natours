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

   await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stat[0].nRating,
        ratingsAverage: stat[0].averageRating
    })
}


reviewSchema.post('save', function(){
    this.constructor.calcAverageStats(this.tourRef)
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    //this.r = await this.findOne()
    console.log(await this.findOne())
    next()
})

// reviewSchema.post(/^findOneAnd/, async function(){
//     await this.r.calcAverageStats(this.r.tourRef.id)
// })
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review