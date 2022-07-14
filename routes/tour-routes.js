const express = require('express');
const tourControllers = require('../controllers/tour-controllers');

const router = express.Router();

const {
  getAllTour,
  getTour,
  deleteTour,
  updateTour,
  createTour,
  checkId,
  checkBody,
} = tourControllers;

router.param('id', checkId);
router.route('/').get(getAllTour).post(checkBody, createTour);
router.route('/:id').delete(deleteTour).put(updateTour).get(getTour);

module.exports = router;
