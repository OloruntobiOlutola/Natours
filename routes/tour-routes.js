const express = require('express');
const tourControllers = require('../controllers/tour-controllers');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/review-routes')

const router = express.Router();

const {
  getAllTour,
  getTour,
  deleteTour,
  updateTour,
  createTour,
  aliasing,
  getToursStats,
  getTourByMonth,
} = tourControllers;

const { protect, restrictTo } = authController;

router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-tours').get(aliasing, getAllTour);
router.route('/monthly-tour/:year').get(protect, restrictTo('admin', 'lead-guide'), getTourByMonth);
router.route('/tours-stats').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getToursStats);
router.route('/').get(getAllTour).post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .get(getTour);

module.exports = router;
