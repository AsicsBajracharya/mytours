const express = require('express');

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

//ROUTERS
const router = express.Router({ mergeParams: true });

//ROUTE ALIAS
router
  .route('/')
  .get(protect, restrictTo('user'), getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router.route('/:id').get(getReview).delete(deleteReview).patch(updateReview);

module.exports = router;
