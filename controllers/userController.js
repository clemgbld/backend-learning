const { pipe } = require('ramda');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const {
  selectbyField,
  paginate,
  sortbyQuery,
  formatQuery,
  filterQuery,
} = require('../utils/apiFeatures');

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
