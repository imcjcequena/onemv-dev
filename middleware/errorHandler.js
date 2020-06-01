/* eslint-disable comma-dangle */
import { responseHandler, Messages } from '../util';
import Logger from '../util/Logger';

// eslint-disable-next-line no-unused-vars
export default (error, req, res, next) => {
  const correlationId = new Date().getTime();
  Logger.error({
    'error-status': error.status,
    'request-url': req.originalUrl,
    'http-method': req.method,
    'request-ip': req.ip,
    'error-detail': error,
    'request-headers': req.headers,
    'correlation-id': correlationId
  });
  responseHandler(res, 500, false, `${Messages.ERROR_500}: "${error.toString()}". CorrelationId : ${correlationId}`);
};
