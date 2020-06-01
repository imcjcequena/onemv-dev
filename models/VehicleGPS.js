import mongoose from 'mongoose';

const VehicleGPSSchema = new mongoose.Schema({
  _id: String,
  vehicle: {
    id: Number,
    name: String,
  },
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
}, { timestamps: true });

export default mongoose.model('vehicle_gps', VehicleGPSSchema);
