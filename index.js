const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const rateLimit = require('express-rate-limit')
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const ErrorHandler = require('./controllers/error-controllers');
const AppError = require('./utils/AppError');

const app = express();

// MIDLEWARES
// Set security headers
app.use(helmet())

// Logging in development mode
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('combined'));
}

// rate limiting for the same IP address
const limiter = rateLimit({
  windowMs: 60 * 60 *1000,
  max: 100,
  message: "Too many request from the same IP address. Try again in 1 hour time."
})
app.use('/api', limiter)

//Body Parser
app.use(express.json({limit: "10kb"}));

// Sanitize the data going to the db
app.use(mongoSanitize())

// Sanitize against xss 
app.use(xss())

// Parameter sanitization
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

// Using Static files
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  const err = new AppError(`http://localhost:3000${req.url} not found`, 404);
  next(err);
});

// Error Handling
app.use(ErrorHandler);

module.exports = app;
