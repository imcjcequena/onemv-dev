import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const UserDeviceSchema = BaseSchema({
  platform: String,
  deviceToken: String,
  snsARN: String,
  isActive: {
    type: Boolean,
    default: true,
  },
});

const UserSchema = BaseSchema({
  firstName: String,
  divisionCode: String,
  middleName: String,
  clientId: {
    unique: true,
    type: Number,
  },
  dateOfBirth: Number,
  phone: {
    countryCode: {
      type: String,
    },
    number: {
      type: String,
    },
  },
  email: String,
  lastName: String,
  passengerCardId: String,
  mobilityAids: String,
  isPara: Boolean,
  passengerId: Number,
  address: {
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
  },
  onemv: {
    sparse: true,
    type: String,
    unique: true,
  },
  google: {
    sparse: true,
    type: String,
    unique: true,
  },
  facebook: {
    sparse: true,
    type: String,
    unique: true,
  },
  onemvPassword: String,
  onemvEmail: {
    sparse: true,
    type: String,
    unique: true,
  },
  devices: [UserDeviceSchema],
});

export default mongoose.model('Users', UserSchema);
