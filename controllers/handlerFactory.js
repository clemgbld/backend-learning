const { pipe } = require('ramda');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  selectbyField,
  paginate,
  sortbyQuery,
  formatQuery,
  filterQuery,
} = require('../utils/apiFeatures');

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(new AppError(`${req.params.id} id doesn't exist`, 404));

    res.status(200).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError(`${req.params.id} id doesn't exist`, 400));

    res.status(204).json({
      status: 'sucess',
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc)
      return next(new AppError(`${req.params.id} id doesn't exist`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // BUILD QUERY
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

    // EXCUTE QUERY
    // const doc = await addFeatures(Model).explain();
    const doc = await addFeatures(Model);

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
