const express = require('express');
const {
  getAllTours,
  getSpecificTour,
  getTourStats,
  updateTour,
  deleteTour,
  createTour,
  aliasTopTour,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('../controllers/tourControler');
const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();
// param middleware
// router.param('id', checkId);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/:id')
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .get(getSpecificTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

module.exports = router;
