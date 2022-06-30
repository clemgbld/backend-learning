const { pipe } = require('ramda');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const User = require('../models/userModel');
const {
  selectbyField,
  paginate,
  sortbyQuery,
  formatQuery,
  filterQuery,
} = require('../utils/apiFeatures');

const filterObj = (obj, ...alowFields) =>
  alowFields.reduce(
    (newobj, field) =>
      obj[field] ? (newobj = { ...newobj, [field]: obj[field] }) : newobj,
    {}
  );

exports.getAllUsers = catchAsync(async (req, res) => {
  const pageAndLimt = {
    page: +req.query.page || 1,
    limit: +req.query.limit || 100,
  };

  const fieldsToExclude = ['page', 'sort', 'limit', 'fields'];

  const excludeFieldsAndIntegrateOps = formatQuery(req.query);

  const addFeatures = pipe(
    filterQuery(excludeFieldsAndIntegrateOps)(fieldsToExclude),
    sortbyQuery(req.query.sort),
    selectbyField(req.query.fields),
    paginate(pageAndLimt)
  );

  const users = await addFeatures(User);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'sucess',
    data: {
      user: updatedUser,
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

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
