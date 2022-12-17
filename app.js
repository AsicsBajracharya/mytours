const fs = require('fs');

const express = require('express');

const app = express();

//TO GET ACCESS TO REQUEST.BODY
app.use(express.json());

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'the home page of an app' });
// });

//READ THE FILE FROM DEV-DATA
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//GET ALL TOUR ROUTE
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours?.length,
    data: {
      tours,
    },
  });
});

//GET A TOUR
app.get('/api/v1/tours/:id', (req, res) => {
  console.log(req.params);
  const tour = tours.find((el) => el.id == req.params.id * 1);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//POST A TOUR ROUTE
app.post('/api/v1/tours', (req, res) => {
  console.log(req.body);
  const newId = tours.length - 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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
});

//STARTING THE SERVER
app.listen(8000, () => {
  console.log('app running at port 8000');
});
