const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide you email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead', 'admin'],
    },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide passwordConfirm'],
    validate: {
      //THIS ONLY WORKS ON SAVE
      validator: function (val) {
        return this.password === val;
      },
      message: 'Password confrimation do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//QUERY MIDDLEWARE
userSchema.pre(/^find/, async function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//DOCUMENT MIDDLEWARE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  } catch (e) {
    console.log('there was an error');
    next();
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//INSTANCE METHODS
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp > JWTTimestamp);
    return (await JWTTimestamp) < changedTimestamp; // 100 < 200
  }

  //FALSE MEANS NOT CHANGED
  return false;
};

// userSchema.statics.testing = function () {
//   console.log('hello from the instance method onthe user schema');
// };

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

//MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
