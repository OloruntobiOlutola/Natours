const express = require('express');
const userControllers = require('../controllers/user-controllers');
const authController = require('../controllers/authController');
const { getOne } = require('../controllers/handlerFactory');

const router = express.Router();

const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo
} = authController;
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteMe,
  updateMyDetails,
  deleteUser,
  getMe
} = userControllers;

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect)
router.patch('/upate-password',  updatePassword);
router.patch('/upate-details',  updateMyDetails);
router.delete('/delete-me',  deleteMe);
router.get('/me',  getMe, getOne)

router.use(restrictTo('admin'))
router.route('/').get(getAllUsers);
router.route('/:id').delete(  deleteUser).get(getUser)

module.exports = router;
