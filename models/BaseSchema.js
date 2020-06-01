import mongoose from 'mongoose';

export default (arg) => {
  const schema = new mongoose.Schema({
    ...arg,
    deleted: {
      type: Boolean,
      default: false,
    },
  }, { timestamps: true, useFindAndModify: false });

  schema.methods.findOne = args => new Promise((resolve, reject) => {
    this.model.findOne(args).then(result => resolve(result))
      .catch(error => reject(error));
  });

  schema.methods.find = (args, args1 = null, args2 = null) => new Promise((resolve, reject) => {
    this.model.find(args, args1, args2).then(result => resolve(result))
      .catch(error => reject(error));
  });

  schema.methods.findOneAndUpdate = (args1, args2, args3) => new Promise((resolve, reject) => {
    this.model.findOneAndUpdate(args1, args2, args3).then(result => resolve(result))
      .catch(error => reject(error));
  });

  schema.methods.create = args => new Promise((resolve, reject) => {
    this.model.create(args).then(result => resolve(result))
      .catch(error => reject(error));
  });

  return schema;
};
