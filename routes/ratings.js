import TripRatingsController from '../controller/TripRating';

const express = require('express');

const router = express.Router();

router.get('/', TripRatingsController.get);

module.exports = router;
