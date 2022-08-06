const express = require('express');
const userControllers = require('../controllers/user-controllers');
const authController = require('../controllers/authController');

const router = express.Router();

const { signUp, logIn, forgotPassword } = authController;
const { getAllUsers, getUser, createUser, updateUser, deleteUser } =
  userControllers;

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forgot-password', forgotPassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').delete(deleteUser).put(updateUser).get(getUser);

module.exports = router;
