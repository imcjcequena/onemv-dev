// eslint-disable-next-line object-curly-newline
import { header, query, body, param } from 'express-validator';
import { division, parameters, validateToken } from '../middleware';
import { validationHandler } from '../util';
import PassengerController from '../controller/Passengers';

const express = require('express');

const router = express.Router();

// Put route specific middleware
router.use([
  [
    header('x-division-id').exists().not().isEmpty(),
  ],
  validationHandler,
  division,
  parameters,
]);

router.get('/', validateToken, PassengerController.get);

router.get(
  '/:id',
  [
    param('id').exists().not().isEmpty(),
  ],
  validationHandler,
  validateToken,
  PassengerController.findOne,
);

router.get(
  '/:id/trips',
  [
    // eslint-disable-next-line newline-per-chained-call
    query('filter[schedule]').exists().isIn(['today', 'future', 'recent']).not().isEmpty(),
    query('filter[tripStatus]').optional(),
    param('id').exists().not().isEmpty(),
  ],
  validationHandler,
  validateToken,
  PassengerController.findOneWithTrips,
);

router.get(
  '/:clientId/verify',
  [
    param('clientId').exists().not().isEmpty(),
    query('provider').exists(),
    query('providerId').exists(),
  ],
  validationHandler,
  PassengerController.verifyClient,
);

router.put(
  '/:clientId/verify',
  [
    param('clientId').exists().not().isEmpty(),
    body('firstName').exists(),
    body('middleName').exists(),
    body('lastName').exists(),
  ],
  validationHandler,
  PassengerController.createUserPassenger,
);

router.put(
  '/:clientId/registerDevice',
  [
    param('clientId').exists().not().isEmpty(),
    body('deviceToken').exists(),
  ],
  validationHandler,
  PassengerController.registerUserDevice,
);

router.put(
  '/:clientId/unregisterDevice',
  [
    param('clientId').exists().not().isEmpty(),
    body('deviceToken').exists(),
  ],
  validationHandler,
  PassengerController.unsubscribeDevice,
);

router.get(
  '/:id/trips/next',
  [
    param('id').exists().not().isEmpty(),
  ],
  validationHandler,
  validateToken,
  PassengerController.nextTrip,
);

module.exports = router;
