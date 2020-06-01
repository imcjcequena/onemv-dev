/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unneeded-ternary */
import moment from 'moment';
import {
  responseHandler,
  Messages,
  Defaults,
  getTodayFromDivision,
  getQueryStringFilters,
  getQueryStringSorting,
} from '../util';
import { TripRating, Trip } from '../models';

const formatTime = (tripDate, time, format = 'h:mm A') => {
  const timeDur = moment.duration({ s: time });
  return tripDate.startOf('day').add(timeDur).format(format);
};

const formatTrip = (fTrip, currDivisionTime) => {
  const timeFormat = 'h:mm A';
  let startDuration;
  let endDuration;
  let sTime;
  let eTime;
  let trip;
  if (fTrip.toJSON) {
    trip = fTrip.toJSON();
  } else {
    trip = fTrip;
  }
  const tripDate = moment(trip.trip_date, 'YYYYMMDD');
  trip.trip_date_display = tripDate.format('MM/DD/YYYY');
  if (trip.pickup.start_window && trip.pickup.end_window) {
    startDuration = moment.duration({ s: trip.pickup.start_window });
    endDuration = moment.duration({ s: trip.pickup.end_window });
    sTime = tripDate.startOf('day').add(startDuration).format(timeFormat);
    eTime = tripDate.startOf('day').add(endDuration).format(timeFormat);
    trip.pickup.window_display = `${sTime} - ${eTime}`;
  }
  if (trip.pickup.actual_arrival_time) {
    trip.pickup.actualArrivalTimeDisplay = formatTime(tripDate, trip.pickup.actual_arrival_time);
  }

  if (trip.pickup.actual_departure_time) {
    trip.pickup.actualDepartureTimeDisplay = formatTime(tripDate, trip.pickup.actual_departure_time);
  }

  if (trip.pickup.estimated_arrival_time) {
    const estimatedArrivalTimeDur = moment.duration({ s: trip.pickup.estimated_arrival_time });
    const estimatedArrivalTimeDisplay = tripDate.startOf('day').add(estimatedArrivalTimeDur).format('DD/MM/YYYY HH:mm:ss');
    const ms = moment(currDivisionTime, 'DD/MM/YYYY HH:mm:ss').diff(moment(estimatedArrivalTimeDisplay, 'DD/MM/YYYY HH:mm:ss'));
    const d = moment.duration(ms).asMinutes();
    trip.pickup.etaStr = d;
  }

  if (trip.dropoff.start_window && trip.dropoff.end_window) {
    startDuration = moment.duration({ s: trip.dropoff.start_window });
    endDuration = moment.duration({ s: trip.dropoff.end_window });
    sTime = tripDate.startOf('day').add(startDuration).format(timeFormat);
    eTime = tripDate.startOf('day').add(endDuration).format(timeFormat);
    trip.dropoff.window_display = `${sTime} - ${eTime}`;
  }
  if (trip.dropoff.actual_arrival_time) {
    trip.dropoff.actualArrivalTimeDisplay = formatTime(tripDate, trip.dropoff.actual_arrival_time);
  }

  if (trip.dropoff.actual_departure_time) {
    trip.dropoff.actualDepartureTimeDisplay = formatTime(tripDate, trip.dropoff.actual_departure_time);
  }
  if (trip.dropoff.estimated_arrival_time) {
    trip.dropoff.estimatedArrivalTimeDisplay = formatTime(tripDate, trip.dropoff.estimated_arrival_time);
  }

  if (trip.dropoff.estimated_arrival_time) {
    const estimatedArrivalTimeDur = moment.duration({ s: trip.dropoff.estimated_arrival_time });
    const estimatedArrivalTimeDisplay = tripDate.startOf('day').add(estimatedArrivalTimeDur).format('DD/MM/YYYY HH:mm:ss');
    const ms = moment(currDivisionTime, 'DD/MM/YYYY HH:mm:ss').diff(moment(estimatedArrivalTimeDisplay, 'DD/MM/YYYY HH:mm:ss'));
    const d = moment.duration(ms).asMinutes();
    trip.dropoff.etaStr = d;
  }
  return trip;
};


const formatTrips = (trips, currDivisionTime) => {
  const retTrips = [];
  trips.forEach((trip) => {
    retTrips.push(formatTrip(trip, currDivisionTime));
  });
  return retTrips;
};

const get = async (req, res, next) => {
  // TODO: use JSON API standard for sparse field and sorting
  // Sorting: ASCENDING http://myurl.com/sort=tripDate,divisionCode
  // Sorting: Descending - use prefix with a minus (U+002D HYPHEN-MINUS, “-“) eg. http://localhost:4000/trips?sort=-trip_date
  // sort only takes 1 argument clause
  // Filter: All filter should be inside filter query. eg. http://localhost:4000/trips?filter[division_code]=54&filter[trip_id]=844595
  // Or filter: http://localhost:4000/trips?filter[trip_status]=Unscheduled,Completed
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : Defaults.QUERY_LIMIT;
  const page = req.query.page ? parseInt(req.query.page, 10) : Defaults.QUERY_PAGE;
  const skip = (page - 1) * limit;
  const { division } = req;
  try {
    const currentDivisionTime = await getTodayFromDivision(division._id, 'DD/MM/YYYY HH:mm:ss');
    let sort = [];
    let result;
    let { filter } = req.query ? req.query : {};
    if (req.query.filter) {
      filter = getQueryStringFilters(filter);
    }
    if (req.query.sort) {
      sort = getQueryStringSorting(req.query.sort);
      result = await Trip.find(filter, null, { limit, skip, sort });
    } else {
      result = await Trip.find(filter, null, { limit, skip });
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_ALL_TRIPS, formatTrips(result, currentDivisionTime));
  } catch (error) {
    return next(error);
  }
};

const findOne = async (req, res, next) => {
  const { division: { parameters }, division } = req;
  const tripId = req.params.id;
  try {
    let result = await Trip.findOne({ trip_id: tripId, division_code: division.code });
    if (!result) {
      return responseHandler(res, 200, false, Messages.ERROR_NO_TRIPS_FOUND, result);
    }
    const currentDivisionTime = await getTodayFromDivision(division._id, 'DD/MM/YYYY HH:mm:ss');
    result = result.toObject();
    result.is_imminent = false;
    if (result.trip_status === 'Scheduled') {
      const leadTimeParam = parameters.filter(p => p.key === 'lead-time')[0];
      const leadTime = leadTimeParam.value;
      const utcImminentStartTime = moment.utc().add(leadTime, 'minutes');
      if (utcImminentStartTime >= result.pickup.start_window_utc) {
        result.is_imminent = true;
      }
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_FIND_TRIP, formatTrip(result, currentDivisionTime));
  } catch (error) {
    return next(error);
  }
};

const createTripRatings = async (req, res, next) => {
  const tripId = req.params.id;
  const {
    passengerId,
    rating,
    comments,
  } = req.body;
  try {
    let result;
    const trip = await Trip.findOne({ _id: tripId });
    if (!trip) {
      return responseHandler(res, 400, false, Messages.ERROR_NO_TRIPS_FOUND, result);
    }

    // check if tripRating object is existing
    const tripRating = await TripRating.findOne({ tripId });

    if (!tripRating) {
    // create new tripRating object with ratings
      const newTripRating = {
        tripId,
        ratings: [
          {
            passengerId,
            comments,
            rating,
          },
        ],
      };
      result = await TripRating.create(newTripRating);
      return responseHandler(res, 200, true, Messages.SUCCESS_TRIP_RATING_CREATED, result);
    }

    // check if passenger already rated
    if (tripRating.ratings.filter(item => parseInt(passengerId, 10) === item.passengerId).length > 0) {
      return responseHandler(res, 400, false, Messages.ERROR_PASSENGER_ALREADY_RATED, result);
    }

    const newRatings = {
      passengerId,
      ...(comments ? { comments } : {}),
      rating,
    };
    result = await TripRating.findOneAndUpdate({ tripId }, { ratings: tripRating.ratings.concat(newRatings) }, { new: true });

    return responseHandler(res, 200, true, Messages.SUCCESS_TRIP_RATING_CREATED, result);
  } catch (error) {
    return next(error);
  }
};

const getRatings = async (req, res, next) => {
  const tripId = req.params.id;
  try {
    const result = await TripRating.findOne({ tripId });
    if (!result) {
      return responseHandler(res, 200, false, Messages.ERROR_NO_TRIPS_FOUND, result);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_FIND_TRIP_RATINGS, result);
  } catch (error) {
    return next(error);
  }
};

export default {
  get,
  findOne,
  createTripRatings,
  getRatings,
  formatTrip,
  formatTrips,
};
