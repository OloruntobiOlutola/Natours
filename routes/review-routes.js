const express = require('express')
const reviewController = require('../controllers/review-controller')
const authController = require("../controllers/authController")

const router = express.Router()

const {getAllReview, createReview} = reviewController
const {restrictTo, protect} = authController

router.route('/').get(getAllReview).post(protect, restrictTo('user'), createReview)

module.exports = router;