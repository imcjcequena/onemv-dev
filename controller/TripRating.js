
import { TripRating } from '../models';
import {
  Defaults,
  Messages,
  responseHandler,
} from '../util';


const get = async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : Defaults.QUERY_LIMIT;
  const page = req.query.page ? parseInt(req.query.page, 10) : Defaults.QUERY_PAGE;
  const skip = (page - 1) * limit;
  try {
    const result = await TripRating.find({ }, null, { limit, skip });
    return responseHandler(res, 200, true, Messages.SUCCESS_ALL_TRIP_RATINGS, result);
  } catch (error) {
    return next(error);
  }
};

export default {
  get,
};
