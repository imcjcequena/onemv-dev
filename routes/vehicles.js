// import { Messages } from '../util';
import { param } from 'express-validator';
import { VehicleGPS } from '../models';
import { division, parameters } from '../middleware';
import { responseHandler, Messages, validationHandler } from '../util';

const express = require('express');

const router = express.Router();

const moment = require('moment');

/* GET latest active gps co-ords for a vehicle */
router.get(
  '/:id/latest-gps',
  [
    param('id').exists().not().isEmpty(),
  ],
  division,
  parameters,
  validationHandler,
  async (req, res, next) => {
    const vehicleId = parseInt(req.params.id, {});
    const divisionCode = req.division.code;
    const divisionParams = req.division.parameters;
    const trailTimeParam = divisionParams.find(p => p.key === 'trail-time');
    const trailTime = trailTimeParam === null ? 20 : trailTimeParam.value;
    const leadTimeParam = divisionParams.find(p => p.key === 'lead-time');
    const leadTime = trailTimeParam === null ? 10 : leadTimeParam.value;
    const utcTrailTime = moment.utc().subtract(trailTime, 'minute').toDate();
    const utcLeadTime = moment.utc().add(leadTime, 'minute').toDate();
    try {
      const result = await VehicleGPS
        .find({ 'vehicle.id': vehicleId, division_code: divisionCode })
        .where('created_date_time_utc').gte(utcTrailTime).lte(utcLeadTime)
        .sort({ created_date_time_utc: -1 })
        .limit(1);
      if (!result || result.length < 1) {
        responseHandler(res, 200, false, Messages.ERROR_NO_VEHICLE_LOCATION);
      }
      responseHandler(res, 200, true, Messages.SUCCESS_FETCHING_LATEST_LOCATION, result);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
