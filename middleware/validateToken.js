
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
import { Messages, responseHandler } from '../util';
// import { ApiKey } from '../models';

// eslint-disable-next-line consistent-return
export default async (req, res, next) => {
  const jwtToken = req.headers.authorization && req.headers.authorization.split(' ')[1];

  // const { key, secret } = req.headers;

  // if (key && secret) {
  //   const result = await ApiKey.findOne({ key });

  //   if (!result) return responseHandler(res, 400, false, Messages.ERROR_INVALID_API_KEY);

  //   if (!result.active) return responseHandler(res, 400, false, Messages.ERROR_INVALID_API_KEY);

  //   if (!bcrypt.compareSync(secret, key)) {
  //     return responseHandler(res, 400, false, Messages.ERROR_INVALID_API_KEY);
  //   }
  //   return next();
  // // eslint-disable-next-line no-else-return
  // } else {
  if (!jwtToken) {
    return responseHandler(res, 400, false, Messages.UNAUTHORIZED);
  }
  jwt.verify(jwtToken, process.env.JWT_SECRET, (error) => {
    if (error) {
      return responseHandler(res, 401, false, Messages.ERROR_NOT_VALID_TOKEN);
    }
    return next();
  });
  // }
};
