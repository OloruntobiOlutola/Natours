const AppError = require('../utils/AppError');

const handleCastError = (err) => {
  let message = `The ${err.path} does not contain ${err.value}`;
  return new AppError(message, 400);
};

const handleWebTokenError = (err) => new AppError(err.message, 401);

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  console.log(err.operational);
  if (err.operational === true) {
    res.status(404).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV == 'development') {
    devError(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.name === 'JsonWebTokenError') error = handleWebTokenError(error);
    prodError(error, res);
  }
  next();
};
