const fs = require('fs');

const express = require('express');

const app = express();

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

//STARTING THE SERVER
app.listen(8000, () => {
  console.log('app running at port 8000');
});
