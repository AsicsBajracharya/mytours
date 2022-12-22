const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//CREATING A USER
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//LOGGIN IN
// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   // 1) CHECK IF EMAIL AND PASSWORD EXIST
//   if (!email || !password) {
//     return next(new AppError('Email or password does not exist', 400));
//   }
//   // 2) CHECK IF THE USER EXISTS && PASSWORD IS CORRECT
//   const user = await User.find({
//     email,
//   }).select('+password');
//   console.log(user);
//   if (!user || (await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }
//   console.log(user, User);

//   //3) IF EVERYTHING OK, SEND TOKEN
//   const token = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     token,
//   });
// });

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) CHECK IF EMAIL AND PASSWORD EXISTS
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) CHECK IF THE USER EXISTS && PASSWORD IS CORRECT
  const user = await User.findOne({ email: email }).select('+password');

  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or password', 401));
  }
  console.log(user);
  // 3) IF EVERYTING IS OK, SENT TOKEN TO CLIENT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
