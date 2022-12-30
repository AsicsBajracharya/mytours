const express = require('express');

const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

//ROUTERS
const router = express.Router();

//ROUTE ALIAS
router
  .route('/')
  .get(protect, restrictTo('user'), getAllReviews)
  .post(createReview);

module.exports = router;
