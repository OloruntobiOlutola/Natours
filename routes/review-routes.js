const express = require('express')
const reviewController = require('../controllers/review-controller')
const authController = require("../controllers/authController")

const router = express.Router({mergeParams: true})

const {getAllReview, createReview, deleteReview, updateReview} = reviewController
const {restrictTo, protect} = authController

router.route('/').get(getAllReview).post(protect, restrictTo('user'), createReview)
router.route('/:id').delete(protect, restrictTo('admin'), deleteReview).patch(updateReview)

module.exports = router;