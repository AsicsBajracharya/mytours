// const fs = require('fs');

const Tour = require('../models/tourModel');

//READ THE FILE FROM DEV-DATA
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// HANDLERS
//GET ALL TOUR ROUTE
exports.getAllTours = async (req, res) => {
  console.log(req.query, 'req.query');
  try {
    // 1) BUILD QUERY
    //    A) FILTERING
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    const queryObj = { ...req.query };
    const excludedfields = ['page', 'sort', 'limit', 'fields'];

    excludedfields.forEach((el) => delete queryObj[el]);

    console.log(req.query, 'req.query', queryObj);

    // B)ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    console.log(JSON.parse(queryStr));

    const query = Tour.find(JSON.parse(queryStr));

    //{difficulty: 'easy, duration: {$gte: 5}}

    // 2) EXECUTE QUERY
    const tours = await query;

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
