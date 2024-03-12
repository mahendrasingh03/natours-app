const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { use } = require('../app');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, 'please provide a valid Email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm tour password'],
    validate: {
      // this only works on Create and Save!!!
      validator: function (el) {
        return el === this.password; // abc===abc
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordConfirm field
  this.passwordConfirm = undefined;
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this point to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // console.log(this.passwordChangedAt);
  if (this.passwordChangedAt) {
    const changedPasswordtamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedPasswordtamp, JWTTimestamp);
    return JWTTimestamp < changedPasswordtamp;
  }
  // false means not changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
