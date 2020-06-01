import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const TripSchema = BaseSchema({
  _id: String,
  passenger_id: Number,
  division_id: String,
  dropoff: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: Number,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    scheduled_time: Number,
    start_window: Number,
    end_window: Number,
    actual_arrival_time: Number,
    actual_departure_time: Number,
    actual_arrival_Time_utc: Date,
    actual_departure_time_utc: Date,
    scheduled_time_utc: Date,
    start_window_utc: Date,
    end_window_utc: Date,
  },
  pickup: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: Number,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    scheduled_time_utc: Date,
    start_window_utc: Date,
    end_window_utc: Date,
    actual_arrival_time_utc: Date,
    actual_departure_time_utc: Date,
    scheduled_time: Number,
    start_window: Number,
    end_window: Number,
    actual_arrival_time: Number,
    actual_departure_time: Number,
  },
  run_id: Number,
  trip_date: Number,
  trip_fare: Number,
  trip_id: Number,
  trip_status: String,
  vehicle_id: String,
}, { timestamps: true });

export default mongoose.model('Trips', TripSchema);
