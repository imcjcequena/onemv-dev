import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const RatingSchema = BaseSchema({
  passengerId: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comments: String,
  deleted: {
    type: Boolean,
    default: false,
  },
});

const TripRatingSchema = BaseSchema({
  tripId: {
    type: String,
    required: true,
  },
  ratings: [RatingSchema],
  deleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('TripRatings', TripRatingSchema);
