const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user-model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const handlerController = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const fileType = file.mimetype.split('/')[0];
  if (fileType === 'image') {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only an image file', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  let id = req.user.id;
  let timeStamp = Date.now();
  req.file.filename = `user-${id}-${timeStamp}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500, {
      fit: 'contain',
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) {
    update.photo = req.file.filename;
  }
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
