const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const ErrorHandler = require('./controllers/error-controllers');
const AppError = require('./utils/AppError');
const app = express();

// Middlewares
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('combined'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  const err = new AppError(`http://localhost:3000${req.url} not found`, 404);
  next(err);
});

app.use(ErrorHandler);

module.exports = app;
