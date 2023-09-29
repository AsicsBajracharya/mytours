const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

//FUNCTIONS
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// HANDLERS

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) CREATE ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updatePassword',
        400
      )
    );
  }

  //2) UPDATE USER DOCUMENT
  const fileteredBody = filterObj(req.body, ['name', 'email']);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fileteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  console.log('THIS MIDDLEWARE RAN!!!!!!!!!!!');
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

//POST A User ROUTE
exports.createUser = factory.createOne(User);

//PATCHINT A User
//DO NOT UPDATE PASSWORD WITH THIS
exports.updateUser = factory.updateOne(User);

//DELETE A User
exports.deleteUser = factory.deleteOne(User);
