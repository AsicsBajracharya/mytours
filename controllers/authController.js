const { promisify } = require('util'); //BUILT IN FUNCTION
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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
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

// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) GET TOKEN AND CHECK IF IT'S THERE
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   if (!token) {
//     return next(
//       new AppError('You are not logged in, please login to get access', 401)
//     );
//   }
//   // 2) VALIDATE TOKEN
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//   // console.log('decoded', decoded);
//   // 3) CHECK IF USER STILL EXIST
//   const freshUser = await User.findById(decoded.id);
//   if (!freshUser) {
//     return next(
//       new AppError('the user belong to this token does not exist', 401)
//     );
//   }

//   // 4) if user changged password after the token was issued
//   freshUser.changedPasswordAfter(decoded.iat);

//   next();
// });

exports.protect = catchAsync(async (req, res, next) => {
  //1) GETTING TOKEN AND CHECK IF IT'S THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }
  //2) VERIFY TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded', decoded);

  //3) CHECK IF USER STILL EXISTS
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }
  //4) CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  if (await freshUser.changedPasswordAfter(decoded.iat)) {
    console.log(
      'password changed recently',
      freshUser.changedPasswordAfter(decoded.iat)
    );
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //ROLES ['admin', 'lead']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have perssion to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get ueser based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with email address', 404));
  }
  // 2) GENERATE RANDOM RESET TOKEN

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
});

exports.resetPassword = (req, res, next) => {};
