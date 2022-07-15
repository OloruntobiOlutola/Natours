const express = require('express');
const tourControllers = require('../controllers/tour-controllers');

const router = express.Router();

const { getAllTour, getTour, deleteTour, updateTour, createTour } =
  tourControllers;

router.route('/').get(getAllTour).post(createTour);
router.route('/:id').delete(deleteTour).put(updateTour).get(getTour);

module.exports = router;
