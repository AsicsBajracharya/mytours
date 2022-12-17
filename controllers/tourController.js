const fs = require('fs');

//READ THE FILE FROM DEV-DATA
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (req, res, next, val) => {
  if (val * 1 > tours.length) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
    return;
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'fail',
      message: 'missing name or price',
    });
    return;
  }
  next();
};

// HANDLERS
//GET ALL TOUR ROUTE
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours?.length,
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
};

//GET A TOUR ROUTE
exports.getTour = (req, res) => {
  console.log(req.params);
  const tour = tours.find((el) => el.id == req.params.id * 1);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

//POST A TOUR ROUTE
exports.createTour = (req, res) => {
  console.log(req.body);
  const newId = tours.length - 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      console.log('there is an error');
    }
  );
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
};

//PATCHINT A TOUR
exports.updateTour = (req, res) => {
  res.send('patch request goes here');
};

//DELETE A TOUR
exports.deleteTour = (req, res) => {
  res.send('delete request goes here');
};
