const mongoose = require('mongoose');

const slugify = require('slugify');

const validator = require('validator');

const User = require('./userModel');

//SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more than 10 characters'],
      // validate: [validator.isAlpha, 'a tour name must not have a number in it'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is  either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: String,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //CUSTOM VALIDATION DOESN'T WORKS ON UPDATE
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      select: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: Array,
  },
  {
    //SCHEMA OPTIONS
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE : runs before the save() command and create()
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc, next) {
  // console.log(doc, ' from the post middleware');
  next();
});

tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);

  next();
});

///QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // console.log(this, 'query middleware');
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log('query took', Date.now() - this.start);
  // console.log(docs);
  next();
});
//MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
