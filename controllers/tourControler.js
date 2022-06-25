const { pipe } = require('ramda');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/toursModels');
const {
  selectbyField,
  paginate,
  sortbyQuery,
  formatQuery,
  filterQuery,
} = require('../utils/apiFeatures');

// tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (req, res, next, val) => {
// if (+val > tours.length) {
//   return res.status(404).json({
//     status: 'failed',
//     message: 'Invalid Id',
//   });
// }

//   next();
// };

exports.aliasTopTour = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: 5,
    sort: 'ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
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
  const tours = await addFeatures(Tour);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getSpecificTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findByOne({_id:req.params.id})

  if (!tour)
    return next(new AppError(`${req.params.id} id doesn't exist`, 400));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour)
    return next(new AppError(`${req.params.id} id doesn't exist`, 400));

  res.status(200).json({
    status: 'sucess',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour)
    return next(new AppError(`${req.params.id} id doesn't exist`, 400));

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'Missing name or price',
//     });
//   }

//   next();
// };

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'sucess',
    data: {
      tour: newTour,
    },
  });
});

// Agregation

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: {
          $sum: 1,
        },
        numRatings: {
          $sum: '$ratingsQuantity',
        },
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },

    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      plan,
    },
  });
});
