const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // res.send('delete request goes here');
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // const tour = tours.find((el) => el.id == req.params.id * 1);

    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    // const doc = await Model.findById(req.params.id).populate('reviews');
    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc?.length,
      requestedAt: req.requestTime,
      data: {
        data: doc,
      },
    });
  });
