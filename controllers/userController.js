const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
