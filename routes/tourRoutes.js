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
} = require('../controllers/tourControler');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();
// param middleware
// router.param('id', checkId);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

router.route('/').get(protect, getAllTours).post(createTour);

router
  .route('/:id')
  .patch(updateTour)
  .get(getSpecificTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
