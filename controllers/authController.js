const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user-model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = async (user, statusCode, res) => {
  const token = await signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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

  createAndSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please enter a valid password and email', 400));

  const user = await User.findOne({ email: email }).select('+password');

  if (!(await bcrypt.compare(password, user.password)) || !user)
    return next(new AppError('Invalid email or password', 401));

  createAndSendToken(user, 200, res);
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
  user.save({ validateBeforeSave: false });

  // 3. Send token to the email addess
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `To reset your password click on the link below to submit your new password: ${resetUrl}`;

  try {
    await sendEmail({
      message,
      email: user.email,
      subject: "Your password reset url. It's valid for 10mins",
    });

    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to your mail',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordTokenExpires = undefined),
      await user.save({ validateBeforeSave: false });
    next(new AppError('Error while sending the token to your mail', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or it has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordTokenExpires = undefined;
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { newPassword, newPasswordConfirm } = req.body;
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return next(new AppError('Your password is incorrect', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});
