const { promisify } = require('util'); //BUILT IN FUNCTION
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.ENV == 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //REMOVE THE PASSWORD FROM THE OUTPUT
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, 201, res);
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

  // 3) IF EVERYTING IS OK, SENT TOKEN TO CLIENT
  createSendToken(user, 200, res);
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

  // 3) SEND TO SUER VIA EMAIL
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(user, 'user from the forgot password');
    return next(
      new AppError(
        'there was an error while sending the email. please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);

  // 3) update changepasswordat property for the user

  //   4) log the user in
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) GET USER FROM THE COLLECTION
  const user = await User.findById(req.user.id).select('password');

  // 2) CHECK IF POSTED CURRENT PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your current password is incorrect', 401));
  }
  // 3) IF SO, UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) LOG THE USER IN
  createSendToken(user, 200, res);
});
