const express = require('express');
const tourControllers = require('../controllers/tour-controllers');

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

router.route('/top-5-tours').get(aliasing, getAllTour);
router.route('/monthly-tour/:year').get(getTourByMonth);
router.route('/tours-stats').get(getToursStats);
router.route('/').get(getAllTour).post(createTour);
router.route('/:id').delete(deleteTour).put(updateTour).get(getTour);

module.exports = router;
