const express = require('express');

//lOGGER MIDDLEWARE
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//TO GET ACCESS TO REQUEST.BODY
app.use(express.json());

//SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));

//3rd PARTY LOGGER MIDDLEWARE
// console.log(process.env.ENV);
if (process.env.ENV === 'development') {
  app.use(morgan('dev'));
}

//CUSTOM MIDDLEWARE
// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

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

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl}`,
  // });
  const err = new Error(`can't find ${req.originalUrl}`);
  err.status = 'fail';
  err.statuscode = 404;

  next(err);
});

//GLOBAL ERROR HANDLER MIDDLEWARE
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
