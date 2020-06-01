
import User from '../models/User';


const createUserWithDefaultPassword = (userFields = {}) => {
  const data = {
    ...userFields,
  };

  return new Promise((resolve, reject) => {
    User.create(data).then(result => resolve(result))
      .catch(error => reject(error));
  });
};

const findOne = args => new Promise((resolve, reject) => {
  User.findOne(args).then(result => resolve(result))
    .catch(error => reject(error));
});

export default {
  createUserWithDefaultPassword,
  findOne,
};
