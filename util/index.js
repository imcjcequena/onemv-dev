/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
// Entry point for all Utility and Helpers
import request from 'request';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export { default as Messages } from './Messages';
export { default as Defaults } from './Defaults';
export { default as AWS } from './AWS';


export const isObjectEmpty = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

export const responseHandler = (res, statusCode, isSuccess, message, result) => res.status(statusCode).json({
  success: isSuccess,
  message,
  ...(result ? { data: result } : {}),
});


export const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(res, 422, false, errors.array());
  }
  return next();
};

export const createJWTToken = (userData) => {
  const options = {
    expiresIn: process.env.JWT_EXP_DURATION,
  };
  return jwt.sign(userData, process.env.JWT_SECRET, options);
};

export const comparePassword = (password, hash) => new Promise(resolve => bcrypt.compare(password, hash).then(result => resolve(result)).catch(() => resolve(false)));

export const getTodayFromDivision = (divisionId, format = null) => {
  const url = `${process.env.DIVISIONS_API}/divisions/${divisionId}/now${format === null ? '' : `?format=${format}`}`;

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    request.get(url, {
      json: true,
      headers: {
        key: process.env.DIVISION_KEY,
        secret: process.env.DIVISION_SECRET,
      },
    // eslint-disable-next-line consistent-return
    }, (error, resp, result) => {
      if (error) {
        // TODO: log error
        switch (error.code) {
          case 'ECONNREFUSED':
            return reject(new Error(error.code));
          default:
            return reject(new Error(error.code));
        }
      }
      if (!result.success) {
        reject(result.message);
      } else {
        resolve(result.data);
      }
    });
  });
};

export const getQueryStringFilters = (queryFilter) => {
  const filter = queryFilter;
  Object.entries(filter).map((item) => {
    if (item[1].includes(',')) {
      filter[item[0]] = item[1].split(',');
      // return { [item[0]]: item[1].split(',') };
    }
    return {};
  });
  return filter;
};


export const getQueryStringSorting = (querySort) => {
  let sort = [];
  sort = querySort.split(',').map((sc) => {
    if (sc.indexOf('-', 0) === 0) {
      const key = sc.substr(1);
      return ({ [key]: -1 });
    }
    return ({ [sc]: 1 });
  });
  if (sort.length > 1) {
    let sortFields = {};
    sort.forEach((element) => {
      sortFields = Object.assign(sortFields, element);
    });

    return new Array(sortFields);
  }
  return sort;
};

export const generateID = () => {
  const length = 20; // default length
  const characterSet = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += characterSet.charAt(Math.floor(Math.random() * length));
  }
  return result;
};
