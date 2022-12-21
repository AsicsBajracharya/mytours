const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //1 log error
    console.error('ERROR', err);
    //2 send generic message
    res.status(500).json({
      status: 'errorGeneric',
      message: 'something went wrong',
    });
  }
};
//GLOBAL ERROR HANDLER MIDDLEWARE

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.ENV == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.ENV == 'production') {
    sendErrorProd(err, res);
  }
};
