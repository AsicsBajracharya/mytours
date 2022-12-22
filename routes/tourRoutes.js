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

// ROUTERS
// DECLEARING ROUTERS
const router = express.Router();

// router.param('id', checkId);

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
