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
});

userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordConfirm field
  this.passwordConfirm = undefined;
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
