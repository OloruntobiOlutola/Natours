const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name is required for all tours'],
      maxLength: [40, 'A tour name must not be more than 40 characters'],
      minLength: [10, 'A tour name must be at least 10 characters'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maximum size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can only be set to: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Ratings must be atleast 1.0'],
      max: [5.0, "Ratings can't be above 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount can't be greater than price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTours: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: 'Point'
      },
      coordinates: [Number],
      description: String,
      address: String
    },
    locations: [
      {
      type: {
        type: String,
        default: 'Point',
        enum: 'Point'
      },
      coordinates: [Number],
      description: String,
      address: String,
      day: Number,
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationInWeeks').get(function () {
  return (this.duration / 7).toFixed(2) * 1;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tourRef',
  localField: "_id"
})

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre(/^find/, function (next) {
//   console.log(this.find({ secretTours: { $eq: true } }));
//   this.find({ secretTours: { $eq: undefined } });
//   next();
// });

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
