const fs = require('fs');

const express = require('express');

const app = express();

//TO GET ACCESS TO REQUEST.BODY
app.use(express.json());

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'the home page of an app' });
// });

//CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

//MANIPULATING REQ FROM CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
//READ THE FILE FROM DEV-DATA
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//GET ALL TOUR ROUTE
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours?.length,
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
});

//GET A TOUR ROUTE
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

//PATCHINT A TOUR
app.patch('/api/v1/tours/:id', (req, res) => {
  res.send('patch request goes here');
});

//DELETE A TOUR
app.delete('/api/v1/tours/:id', (req, res) => {
  res.send('delete request goes here');
});

//CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

//A BETTER WAY TO HANDLE ROUTES
// app.route('/api/v1.tours').get(getAllTours).post(createTour)
// app.route('/api/v1/tours/:id').get(getATour).patch(updateTour).delete(deleteTour)
//STARTING THE SERVER
app.listen(8000, () => {
  console.log('app running at port 8000');
});
