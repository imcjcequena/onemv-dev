import request from 'request';
import { responseHandler, Messages } from '../util';

// eslint-disable-next-line consistent-return
export default (req, res, next) => {
  const divisionId = req.headers['x-division-id'];
  if (!divisionId) {
    return responseHandler(res, 422, false, Messages.ERROR_HEADER_DIVISION_ID);
  }
  const url = `${process.env.DIVISIONS_API}/divisions/${divisionId}/parameters`;
  request.get(url,
    {
      json: true,
      timeout: 10000,
      headers: {
        key: process.env.DIVISION_KEY,
        secret: process.env.DIVISION_SECRET,
      },
    }, (error, resp, result) => {
      if (error) {
        // TODO: Handle Error
        switch (error.code) {
          case 'ECONNREFUSED':
            return responseHandler(res, 422, false, Messages.ERROR_DIVISION_API_NOT_FOUND);
          default:
            return responseHandler(res, 422, false, Messages.ERROR_OCCURED_DIVISION_API);
        }
      } else if (result.success === false) {
        return responseHandler(res, 422, false, result.message);
      } else {
        req.division.parameters = result.data;
        return next();
      }
    });
};
