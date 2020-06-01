import { body } from 'express-validator';
import { validationHandler } from '../util';
import AppVersionController from '../controller/AppVersions';

const express = require('express');

const router = express.Router();


router.get('/', AppVersionController.get);

router.get('/latest', AppVersionController.getLatest);

router.post(
  '/',
  [
    body('version').exists(),
    body('buildNumber').exists(),
    body('isActive').exists(),
  ],
  validationHandler,
  AppVersionController.create,
);

router.put('/:version', AppVersionController.update);

module.exports = router;
