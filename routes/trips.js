import { header, param, body } from 'express-validator';
import { division, parameters } from '../middleware';
import { validationHandler } from '../util';
import TripsController from '../controller/Trip';

const express = require('express');

const router = express.Router();

// Put route specific middleware
router.use([
  [
    header('x-division-id').exists().not().isEmpty(),
  ],
  division,
  parameters,
  validationHandler,
]);

router.get('/', TripsController.get);

router.get(
  '/:id',
  [
    param('id').exists().not().isEmpty(),
  ],
  validationHandler,
  TripsController.findOne,
);

router.put(
  '/:id/ratings',
  [
    param('id').exists().not().isEmpty(),
    body('passengerId').exists().not().isEmpty(),
    body('rating').exists().not().isEmpty(),
    body('comments').exists(),
  ],
  validationHandler,
  TripsController.createTripRatings,
);

router.get(
  '/:id/ratings',
  [
    param('id').exists().not().isEmpty(),
  ],
  validationHandler,
  TripsController.getRatings,
);

module.exports = router;
