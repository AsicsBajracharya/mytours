const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

// ROUTERS
// DECLEARING ROUTERS
const router = express.Router();

// router.param('id', checkId);
router.use('/:tourId/reviews', reviewRouter);

// ROUTE ALIAS
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);

//USING ROUTERS
router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead'), deleteTour);

module.exports = router;
