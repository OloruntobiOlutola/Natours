const express = require('express');
const userControllers = require('../controllers/user-controllers');

const router = express.Router();

const { getAllUsers, getUser, createUser, updateUser, deleteUser } =
  userControllers;

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').delete(deleteUser).put(updateUser).get(getUser);

module.exports = router;
