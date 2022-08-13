const User = require('../models/user-model');
const catchAsync = require('../utils/catchAsync');
const handlerController = require('./handlerFactory')


exports.getAllUsers = handlerController.getAll(User)

exports.getUser = handlerController.getOne(User)

exports.deleteUser = handlerController.deleteOne(User)

exports.updateUser = handlerController.updateOne(User)

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMyDetails = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError("You can't change the password using this page", 400)
    );
  }
  const { email, name } = req.body;
  const update = { email, name };
  const updatedUser = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

 
