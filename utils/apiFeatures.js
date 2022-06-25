const { pipe, reduce } = require('ramda');

const excludeFields = (acc, curr) => {
  if (acc[curr]) {
    delete acc[curr];
    return acc;
  }

  return acc;
};

const replaceAllOperator = (queryObj) =>
  JSON.stringify(queryObj).replace(
    /\b(gte|gt|lte|lt)/g,
    (match) => `$${match}`
  );

const transformStrIntoObj = (str) => JSON.parse(str);

const seperateByComma = (str) => str.split(',');

const joinBySpace = (arr) => arr.join(' ');

const seperateByCommaAndJoinbyComma = pipe(seperateByComma, joinBySpace);

exports.sortbyQuery = (sortQuery) => (mongooseQuery) => {
  if (sortQuery) {
    return mongooseQuery.sort(seperateByCommaAndJoinbyComma(sortQuery));
  }

  return mongooseQuery.sort('-createdAt');
};

exports.selectbyField = (fieldsQuery) => (mongooseQuery) => {
  if (fieldsQuery) {
    return mongooseQuery.select(
      `${seperateByCommaAndJoinbyComma(`${fieldsQuery}`)}`
    );
  }

  return mongooseQuery.select('-__v');
};

const calcSkip = ({ page, limit }) => (page - 1) * limit;

exports.paginate = (pageAndLimt) => (mongooseQuery) =>
  mongooseQuery.skip(calcSkip(pageAndLimt)).limit(pageAndLimt.limit);

exports.formatQuery = (query) =>
  pipe(
    reduce(excludeFields, { ...query }),
    replaceAllOperator,
    transformStrIntoObj
  );

exports.filterQuery =
  (queryWellFormated) => (fieldsToExclude) => (mongooseQuery) =>
    mongooseQuery.find(queryWellFormated(fieldsToExclude));
