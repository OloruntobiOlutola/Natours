const express = require('express');
const tourControllers = require('../controllers/tour-controllers');
const authController = require('../controllers/authController');

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
router.route('/top-5-tours').get(aliasing, getAllTour);
router.route('/monthly-tour/:year').get(getTourByMonth);
router.route('/tours-stats').get(getToursStats);
router.route('/').get(protect, getAllTour).post(createTour);
router
  .route('/:id')
  .delete(protect, restrictTo('admin', 'tour-guide'), deleteTour)
  .put(updateTour)
  .get(getTour);

module.exports = router;
