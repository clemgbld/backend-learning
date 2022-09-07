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

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const handleJtwExpiredError = () =>
  new AppError('your token has expired. Please log in again.', 401);

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('ERROR (☞ﾟヮﾟ)☞', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development')
    return sendErrorDev(err, req, res);

  if (err.name === 'CastError')
    return sendErrorProd(handleCastErrorDb(err), req, res);

  if (err.code === 11000)
    return sendErrorProd(handleDuplicateFieldNameDb(err), req, res);

  if (err.name === 'ValidationError')
    return sendErrorProd(handleValidationDb(err), req, res);

  if (err.name === 'JsonWebTokenError')
    return sendErrorProd(handleJWTError(), req, res);

  if (err.name === 'TokenExpiredError')
    return sendErrorProd(handleJtwExpiredError(), req, res);

  sendErrorProd(err, req, res);
};
