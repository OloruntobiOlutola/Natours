const multer = require('multer');
const User = require('../models/user-model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const handlerController = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img');
  },
  filename: (req, file, cb) => {
    let id = req.user.id;
    let timeStamp = Date.now();
    let ext = file.mimetype.split('/')[1];
    cb(null, `user-${id}-${timeStamp}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  const fileType = file.mimetype.split('/')[0];
  if (fileType === 'image') {
    cb(null, true);
  } else {
    cb(new AppError('Please upload the an image file', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('photo');

exports.getAllUsers = handlerController.getAll(User);

exports.getUser = handlerController.getOne(User);

exports.deleteUser = handlerController.deleteOne(User);

exports.updateUser = handlerController.updateOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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
