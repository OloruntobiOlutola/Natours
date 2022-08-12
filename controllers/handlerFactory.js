const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, {
      strict: true,
    });
    if (!doc)
      return next(
        new AppError(`Document with the id ${req.params.id} not found`, 404)
      );
    res.status(204).json({
      status: 'deleted',
      data: null,
    });
  });

  exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedData)
      return next(
        new AppError(`Document with the id ${req.params.id} not found`, 404)
      );
    res.status(200).json({
      status: 'success',
      data: {
        data: updatedData,
      },
    });
  });

  exports.createOne = Model => catchAsync(async (req, res, next) => {
    if (Model === "Review"){
      
    }
    const doc = await Model.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

  exports.getOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id)
  
    if (!doc) 
      return next(
        new AppError(`Document with the id ${req.params.id} not found`, 404)
      );

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      },
    });
  });

  exports.getAll = Model = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .sort()
      .limit()
      .paginate()
      .filter();
  
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
  