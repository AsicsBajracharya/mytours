const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require('../controllers/tourController');

// ROUTERS
// DECLEARING ROUTERS
const router = express.Router();

// router.param('id', checkId);

//USING ROUTERS
router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
