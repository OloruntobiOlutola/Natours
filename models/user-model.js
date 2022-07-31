const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A username is required for all users'],
      maxLength: [20, 'A username must not be more than 20 characters'],
      minLength: [3, 'A username must be at least 3 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email field is required for all users'],
      validate: [validator.isEmail, 'Please enter a valid email'],
      trim: true,
      lowerCase: true,
      unique: true,
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'A password is required for all users'],
      minLength: [8, 'A password must be at least 8 characters'],
      trim: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'A user is required to confirm their password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password does not match',
      },
      trim: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
