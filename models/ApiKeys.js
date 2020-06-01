import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const APIKeysSchema = BaseSchema({
  key: {
    unique: true,
    type: String,
  },
  active: Boolean,
  description: String,
  is_deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ApiKeys', APIKeysSchema);
