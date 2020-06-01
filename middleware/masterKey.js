
import bcrypt from 'bcryptjs';
import { Messages, responseHandler } from '../util';

// eslint-disable-next-line consistent-return
export default async (req, res, next) => {
  try {
    const { key } = req.query;
    const secret = process.env.APP_SECRET;

    if (!key || !bcrypt.compareSync(secret, key)) {
      return responseHandler(res, 400, false, Messages.ERROR_INVALID_API_KEY);
    }
    return next();
  } catch (error) {
    next(error);
  }
};
