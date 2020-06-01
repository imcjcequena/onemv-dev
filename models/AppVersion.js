import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const AppVersionSchema = BaseSchema({
  version: String,
  buildNumber: Number,
  isActive: Boolean,
  description: String,
  is_deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('AppVersions', AppVersionSchema);
