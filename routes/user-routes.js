const express = require('express');
const userControllers = require('../controllers/user-controllers');
const authController = require('../controllers/authController');

const router = express.Router();

const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = authController;
const { getAllUsers, getUser, createUser, updateUser, deleteUser, updateMyDetails } =
  userControllers;

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/upate-password', protect, updatePassword);
router.patch('/upate-details', protect, updateMyDetails);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').delete(deleteUser).put(updateUser).get(getUser);

module.exports = router;
