const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldNameDb = (err) => {
  const value = err.errmsg.match(/"(.*?)"/)[0];
  const message = `Duplicate Field value :${value} Please use another value`;

  return new AppError(message, 400);
};

const handleValidationDb = (err) => {
  const errors = Object.values(err.errors)
    .map(({ message }) => message)
    .join('. ');

  const message = `Invalid input data.${errors}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const handleJtwExpiredError = () =>
  new AppError('your token has expired. Please log in again.', 401);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR (☞ﾟヮﾟ)☞', err);

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') return sendErrorDev(err, res);

  if (err.name === 'CastError')
    return sendErrorProd(handleCastErrorDb(err), res);

  if (err.code === 11000)
    return sendErrorProd(handleDuplicateFieldNameDb(err), res);

  if (err.name === 'ValidationError')
    return sendErrorProd(handleValidationDb(err), res);

  if (err.name === 'JsonWebTokenError')
    return sendErrorProd(handleJWTError(), res);

  if (err.name === 'TokenExpiredError')
    return sendErrorProd(handleJtwExpiredError(), res);

  sendErrorProd(err, res);
};
