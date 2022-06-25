const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'a user must have an email adress'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'email must be a valid email'],
  },

  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'a user must have a password'],
    minLength: 8,
    select: false,
  },
  passwordComfirm: {
    type: String,
    required: [true, 'a user must comfirm his password'],
    validate: [
      function (value) {
        return value === this.password;
      },
      'your comfirm password should be exactly the same than your password',
    ],
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordComfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimesStamp) {
  if (!this.passwordChangedAt) return false;

  const changedTimestamp = +this.passwordChangedAt.getTime() / 1000;

  return JWTTimesStamp < changedTimestamp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
