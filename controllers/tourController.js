// const fs = require('fs');

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

//READ THE FILE FROM DEV-DATA
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//ALIAS
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// HANDLERS
//GET ALL TOUR ROUTE
exports.getAllTours = factory.getAll(Tour);

//GET A TOUR ROUTE
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

//POST A TOUR ROUTE
exports.createTour = factory.createOne(Tour);
//PATCHING A TOUR
exports.updateTour = factory.updateOne(Tour);

//DELETE A TOUR
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
