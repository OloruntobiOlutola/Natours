const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user-model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    roles: req.body.roles,
  });

  const token = await signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please enter a valid password and email', 400));

  const user = await User.findOne({ email: email }).select('+password');

  if (!(await bcrypt.compare(password, user.password)) || !user)
    return next(new AppError('Invalid email or password', 401));

  const token = await signToken(user._id);

  res.status(200).json({
    status: 'success',
    data: {
      token,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in. Kindly log in.', 401));
  }

  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decodedToken.id);

  if (currentUser.changePasswordAfter(decodedToken.iat))
    return next(new AppError('Kindly log in again.', 401));

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(
        new AppError('You are not authorised to perform this action.', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get User based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with the provided email address', 404)
    );
  }
  // 2. Generate random reset token
  const resetToken = user.createPasswordResetToken();
  user.save({validateBeforeSave: false})
  // 3. Send token to the email addess
});