const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordComfirm: req.body.passwordComfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  return res.status(201).json({
    status: 'sucess',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email in password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new AppError('Incorrect email or password', 401));

  const correct = await user.correctPassword(password, user.password);

  if (!correct) return next(new AppError('Incorrect email or password', 401));

  const token = signToken(user._id);

  res.status(200).json({
    status: 'sucess',
    token,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  )
    return next(new AppError('You are not logged in !', 401));

  const token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get acess.', 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError('the user belonging to this token does no longer exist', 401)
    );

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password ! Please login again.', 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findByOne({ email: req.body.email });

  if (!user) return next(new AppError('user not found', 400));
});

exports.resetPassword = (req, res, next) => {};
