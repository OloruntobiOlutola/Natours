const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;
