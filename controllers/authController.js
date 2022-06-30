const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  return res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email in password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new AppError('Incorrect email or password', 401));

  const correct = await user.correctPassword(password, user.password);

  if (!correct) return next(new AppError('Incorrect email or password', 401));

  createAndSendToken(user, 200, res);
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
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('user not found', 404));

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password please forget this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    });

    res.status(200).json({
      staus: 'sucess',
      message: 'Token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;

    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There" was an error sending your email, please try again later.',
        400
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Password is incorrect', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // User.findByIdAndUpdate will not work here as intended
  createAndSendToken(user, 200, res);
});
