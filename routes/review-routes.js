const express = require('express')
const reviewController = require('../controllers/review-controller')
const authController = require("../controllers/authController")

const router = express.Router({mergeParams: true})

const {getAllReview, createReview, deleteReview, updateReview, setUserAndToursIds, getReview} = reviewController
const {restrictTo, protect} = authController

router.use(protect)

router.route('/').get(getAllReview).post(restrictTo('user'), setUserAndToursIds, createReview)
router.route('/:id').delete(restrictTo('admin', 'user'), deleteReview).patch(restrictTo('admin', 'user'), updateReview).get(getReview)

module.exports = router;