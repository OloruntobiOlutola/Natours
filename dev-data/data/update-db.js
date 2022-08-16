const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tour-model');
const Review = require('../../models/review-model');
const User = require('../../models/user-model');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`))

const db_string = process.env.DATABASE.replace(
  '<password>',
  process.env.PASSWORD
);

mongoose
  .connect(db_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
 .then(() => console.log('Connected to the DB'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave: false});
    await Review.create(reviews);
    console.log('successfully added');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany()
    await Review.deleteMany()
    console.log('successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
