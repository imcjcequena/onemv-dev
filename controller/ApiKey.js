
/* eslint-disable consistent-return */
import bcrypt from 'bcryptjs';
import { ApiKey } from '../models';
import {
  Messages,
  responseHandler,
  generateID,
} from '../util';

const generateKey = async (req, res) => {
  try {
    const secret = generateID();
    const salt = bcrypt.genSaltSync(10);
    const key = bcrypt.hashSync(secret, salt);
    // eslint-disable-next-line max-len

    const result = await ApiKey.create({ key, active: true });

    if (!result) return responseHandler(res, 500, true, Messages.ERROR_GENERATING_API_KEY);

    return responseHandler(res, 200, true, Messages.SUCCESS_GENERATING_API_KEY, { key, secret });
  } catch (error) {
    return responseHandler(res, 500, true, Messages.ERROR_GENERATING_API_KEY);
  }
};

export default { generateKey };
