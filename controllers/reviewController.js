const { pipe } = require('ramda');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const {
  selectbyField,
  paginate,
  sortbyQuery,
  formatQuery,
  filterQuery,
} = require('../utils/apiFeatures');

exports.getAllReviews = catchAsync(async (req, res) => {
  const pageAndLimit = {
    page: +req.query.page || 1,
    limit: +req.query.limit || 100,
  };
  const fieldsToExclude = ['page', 'sort', 'limit', 'fields'];

  const excludeFieldsAndIntegrateOps = formatQuery(req.query);

  const addFeatures = pipe(
    filterQuery(excludeFieldsAndIntegrateOps)(fieldsToExclude),
    sortbyQuery(req.query.sort),
    selectbyField(req.query.fields),
    paginate(pageAndLimit)
  );

  const reviews = await addFeatures(Review);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
