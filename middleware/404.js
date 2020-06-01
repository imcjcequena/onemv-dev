import { responseHandler, Messages } from '../util';

export default (req, res) => responseHandler(res, 404, false, Messages.ERROR_404);
