const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Tour = require('./../models/tour-model');
const handlerController = require('./handlerFactory')

exports.aliasing = (req, res, next) => {
  req.query.limit = '5';
  req.query.fields = 'name,price,difficulty,maxGroupSize,summary';
  req.query.sort = 'price,ratingsAverage';
  next();
};

exports.getAllTour = handlerController.getAll(Tour)
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -roles'
  }).populate('reviews')

  if (!tour) 
    return next(
      new AppError(`Tour with the id ${req.params.id} not found`, 404)
    );
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = handlerController.createOne(Tour)

exports.updateTour = handlerController.updateOne(Tour)

exports.deleteTour = handlerController.deleteOne(Tour)

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        totalTours: { $sum: 1 },
        totalRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { totalTours: -1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getTourByMonth = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        //month: convert(_id),
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: {
          $let: {
            vars: {
              monthsInString: [
                '',
                'January',
                'Febuaury',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ],
            },
            in: {
              $arrayElemAt: ['$$monthsInString', '$_id'],
            },
          },
        },
      },
    },
    { $sort: { numTours: -1 } },
  ]);
  res.status(200).json({
    status: 'success',
    reslts: plan.length,
    data: {
      plan,
    },
  });
});

exports.getTourWithin = catchAsync(async(req, res, next) => {
  const {distance, latlng, unit} = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng){
    return next(new AppError('Provide latitude and longitude in the format lat,lng'))
  }

  const radius = unit === "km" ? distance / 6731 : distance / 3958.8
  const tours = await Tour.find({startLocation : {$geoWithin: {$centerSphere: [[lng, lat], radius]}}})
  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    result: tours.length,
    tours
  })
})
