const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (req, res, next, val) => {
  const tour = tours.find((tour) => tour.id === val * 1);
  if (!tour) {
    return res.status(400).json({
      status: 'bad request',
      messege: `tour with id of ${val} does not exist`,
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  const { name, price, description } = req.body;
  console.log(name, price, description);
  if (!price || !name || !description) {
    return res.status(400).json({
      status: 'bad request',
      messege: `include the necessary details`,
    });
  }
  next();
};

exports.getAllTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((tour) => tour.id === req.params.id * 1);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newTour = Object.assign({ id: tours.length }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) return console.log(err);
    }
  );
  res.status(201).json({
    status: 'created',
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === id);
  const filteredTour = tours.filter((tour) => tour.id !== id);
  const updatedTour = req.body;
  const newTour = Object.assign(tour, updatedTour);
  filteredTour.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(filteredTour),
    (err) => {
      if (err) return console.log(err);
    }
  );
  res.status(201).json({
    status: 'updated',
    data: {
      tour: newTour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const id = Number(req.params.id);
  const filteredTour = tours.filter((tour) => tour.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(filteredTour),
    (err) => {
      if (err) return console.log(err);
    }
  );
  res.status(204).json({
    status: 'deleted',
    data: null,
  });
};
