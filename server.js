const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./index');

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

// Variables
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('already listening');
});

//Testing