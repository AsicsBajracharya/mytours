// const fs = require('fs');

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');

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
exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours?.length,
      requestedAt: req.requestTime,
      data: {
        tours,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

//GET A TOUR ROUTE
exports.getTour = async (req, res) => {
  console.log(req.params.id);
  // const tour = tours.find((el) => el.id == req.params.id * 1);
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: 'not found',
    });
  }
};

//POST A TOUR ROUTE
exports.createTour = async (req, res) => {
  console.log(req.body);
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'failed',
      message: e,
    });
  }
};

//PATCHING A TOUR
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

//DELETE A TOUR
exports.deleteTour = async (req, res) => {
  // res.send('delete request goes here');
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e,
    });
  }
};
