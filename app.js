const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorhandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
//Middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// 3d-party middlewware

// middleware for json post requests
app.use(express.json());
// middleware for serving static file
app.use(express.static(`${__dirname}/public`));

// custom middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware');

  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorhandler);

module.exports = app;
