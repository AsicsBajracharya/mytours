const express = require('express');

//lOGGER MIDDLEWARE
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//TO GET ACCESS TO REQUEST.BODY
app.use(express.json());

//3rd PARTY LOGGER MIDDLEWARE
app.use(morgan('dev'));

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

//CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
