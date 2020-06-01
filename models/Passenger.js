import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const PassengerAddressSchema = BaseSchema({
  name: String,
  street_num: String,
  at_street: String,
  city: String,
  state: String,
  zip: String,
  location: {
    type: String,
    coordinates: [Number],
  },
});

const PassengerSchema = BaseSchema({
  ada_code: String,
  addresses: [PassengerAddressSchema],
  division_code: String,
  dob: Number,
  first_name: {
    type: String,
    required: true,
  },
  is_para: Number,
  last_name: {
    type: String,
    required: true,
  },
  middle_name: String,
  mobility_aids: [String],
  passenger_card_id: String,
  passenger_id: {
    type: Number,
    required: true,
  },
});


export default mongoose.model('Passengers', PassengerSchema);
