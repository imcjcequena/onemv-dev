
/* eslint-disable consistent-return */
import { AppVersion } from '../models';
import {
  Messages,
  responseHandler,
  Defaults,
} from '../util';


const get = async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : Defaults.QUERY_LIMIT;
  const page = req.query.page ? parseInt(req.query.page, 10) : Defaults.QUERY_PAGE;
  const skip = (page - 1) * limit;
  try {
    const result = await AppVersion.find({}, null, { limit, skip });
    return responseHandler(res, 200, true, Messages.SUCCESS_ALL_VERSIONS, result);
  } catch (error) {
    return next(error);
  }
};

const getLatest = async (req, res, next) => {
  try {
    const result = await AppVersion.find({ isActive: true }, null, { limit: 1, sort: { buildNumber: -1 } });
    return responseHandler(res, 200, true, Messages.SUCCESS_GETTING_LATEST_VERSION, result);
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = await AppVersion.create(req.body);
    return responseHandler(res, 200, true, Messages.SUCCESS_CREATING_VERSION, result);
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  const { version } = req.params;
  try {
    const result = await AppVersion.findOneAndUpdate({ version }, req.body);
    return responseHandler(res, 200, true, Messages.SUCCESS_CREATING_VERSION, result);
  } catch (error) {
    return next(error);
  }
};

export default {
  get,
  create,
  update,
  getLatest,
};
