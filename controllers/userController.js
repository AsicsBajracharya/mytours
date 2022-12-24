const User = require('../models/userModel');
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

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

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

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: 'this route is not implemented yet',
    },
  });
};

//POST A User ROUTE
exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: 'this route is not implemented yet',
    },
  });
};

//PATCHINT A User
exports.updateUser = (req, res) => {
  res.send('patch request goes here');
};

//DELETE A User
exports.deleteUser = (req, res) => {
  res.send('delete request goes here');
};
