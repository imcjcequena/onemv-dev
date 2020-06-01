/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
// Controller for Passenger
// All business logic will be written here
// e.g Update, create, read
// import request from 'request';
import moment from 'moment';
import { Passenger, Trip, User } from '../models';
import UserController from './Users';
import TripsController from './Trip';
import {
  Defaults,
  Messages,
  responseHandler,
  createJWTToken,
  AWS,
  getTodayFromDivision,
  getQueryStringFilters,
  getQueryStringSorting,
} from '../util';

const nextTrip = async (req, res, next) => {
  const passengerId = parseInt(req.params.id, 10);
  const { division: { parameters }, division } = req;
  try {
    const currentDivsionDate = await getTodayFromDivision(division._id, 'DD/MM/YYYY HH:mm:ss');
    const divToday = parseInt(moment(currentDivsionDate, 'DD/MM/YYYY HH:mm:ss').format('YYYYMMDD'), 10);
    const query = {
      passenger_id: passengerId,
      division_code: division.code,
      trip_status: ['Scheduled', 'Unscheduled'],
      trip_date: divToday,
    };
    const sort = [
      { 'pickup.start_window': 1 },
    ];
    let trip = await Trip.findOne(query, null, { sort });
    if (trip) {
      trip = trip.toObject(); // convert mongoose doc to json
      trip.is_imminent = false;
      const leadTimeParam = parameters.filter(p => p.key === 'lead-time')[0];
      const leadTime = leadTimeParam.value;
      const utcImminentStartTime = moment.utc().add(leadTime, 'minutes');
      if (utcImminentStartTime >= trip.pickup.start_window_utc) {
        trip.is_imminent = true;
      }
    }
    if (!trip) {
      return responseHandler(res, 200, true, Messages.SUCCESS_NO_NEXT_TRIP_FOUND);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_NEXT_TRIP_FOUND, TripsController.formatTrip(trip, currentDivsionDate));
  } catch (errorException) {
    return next(errorException);
  }
};


const get = async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : Defaults.QUERY_LIMIT;
  const page = req.query.page ? parseInt(req.query.page, 10) : Defaults.QUERY_PAGE;
  const skip = (page - 1) * limit;
  try {
    const result = await Passenger.find({ division_code: req.division.code }, null, { limit, skip });
    return responseHandler(res, 200, true, Messages.SUCCESS_ALL_PASSENGERS, result);
  } catch (error) {
    return next(error);
  }
};

const findOne = async (req, res, next) => {
  const passengerId = req.params.id;
  try {
    const result = await Passenger.findOne({ passenger_id: passengerId, division_code: req.division.code });
    if (!result) {
      return responseHandler(res, 200, false, Messages.ERROR_NO_PASSENGER, result);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_FIND_PASSENGER, result);
  } catch (error) {
    return next(error);
  }
};

const findOneWithTrips = async (req, res, next) => {
  // /trips/next?filter[schedule]=today&filter[name]=
  const passengerId = req.params.id;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : Defaults.QUERY_LIMIT;
  const page = req.query.page ? parseInt(req.query.page, 10) : Defaults.QUERY_PAGE;
  const skip = (page - 1) * limit;
  const { division: { parameters }, division } = req;
  let { filter } = req.query ? req.query : {};
  let sort = [];
  if (req.query.filter) {
    filter = getQueryStringFilters(filter);
  }
  if (req.query.sort) {
    sort = getQueryStringSorting(req.query.sort);
  }
  try {
    const passenger = await Passenger.findOne({ passenger_id: passengerId, division_code: req.division.code });
    if (!passenger) {
      return responseHandler(res, 400, false, Messages.ERROR_NO_PASSENGER);
    }
    const format = 'YYYYMMDD';
    const currentDivsionDate = await getTodayFromDivision(division._id, 'DD/MM/YYYY HH:mm:ss');
    const today = parseInt(moment(currentDivsionDate, 'DD/MM/YYYY HH:mm:ss').format(format), 10);
    let tripsData = {};
    if (filter && filter.schedule) {
      switch (filter.schedule) {
        case 'today': {
          const tripStatus = filter && filter.tripStatus ? filter.tripStatus.toString().split(',') : 'Scheduled';
          tripsData = await Trip.find({ passenger_id: passengerId, trip_status: tripStatus, trip_date: today }, null, { limit, skip, sort });
          const todayTrips = [];
          if (tripsData) {
            for (let trip of tripsData) {
              trip = trip.toObject();
              trip.is_imminent = false;
              const leadTimeParam = parameters.filter(p => p.key === 'lead-time')[0];
              const leadTime = leadTimeParam.value;
              const utcImminentStartTime = moment.utc().add(leadTime, 'minutes');
              if (utcImminentStartTime >= trip.pickup.start_window_utc) {
                trip.is_imminent = true;
              }
              todayTrips.push(trip);
            }
            tripsData = todayTrips;
          }
          break;
        }
        case 'future': {
          const futureDaysParam = req.division.parameters.filter(p => p.key === 'my-trips-lookup-future')[0];
          const futureDays = futureDaysParam.value;
          const maxLookupDate = parseInt(moment(today, format).add(futureDays, 'days').format(format), 10);

          tripsData = await Trip.find({ passenger_id: passengerId, trip_date: { $gt: today, $lt: maxLookupDate } }, null, { limit, skip, sort });
          break;
        }
        case 'recent': {
          const pastDaysParam = req.division.parameters.filter(p => p.key === 'my-trips-lookup-past')[0];
          const pastDays = pastDaysParam.value;
          const minLookupDate = parseInt(moment(today, format).subtract(pastDays, 'days').format(format), 10);

          tripsData = await Trip.find({ passenger_id: passengerId, trip_date: { $lte: today, $gt: minLookupDate } }, null, { limit, skip, sort });
          const recentTrips = [];
          for (const trip of tripsData) {
            if (trip.trip_status !== 'Scheduled' && trip.trip_status !== 'Unscheduled') {
              recentTrips.push(trip);
            }
          }
          tripsData = recentTrips;
          break;
        }
        default: {
          tripsData = await Trip.find({ passenger_id: passengerId }, null, { limit, skip });
          break;
        }
      }
      return responseHandler(res, 200, true, Messages.SUCCESS_FIND_PASSENGER_TRIP, TripsController.formatTrips(tripsData, currentDivsionDate));
    }
    tripsData = await Trip.find({ passenger_id: passengerId }, null, { limit, skip });
    return responseHandler(res, 200, true, Messages.SUCCESS_FIND_PASSENGER_TRIP, TripsController.formatTrips(tripsData, currentDivsionDate));
  } catch (error) {
    return next(error);
  }
};

const createUserPassenger = async (req, res, next) => {
  const clientId = parseInt(req.params.clientId, 10);
  const divisionCode = req.division.code;
  const dateOfBirth = parseInt(req.body.dateOfBirth, 10);
  const {
    firstName,
    lastName,
    middleName,
    passengerId,
  } = req.body;

  const data = divisionCode === '299' ? {
    clientId: +(`${clientId}${divisionCode}`),
    divisionCode,
    firstName,
    middleName,
    lastName,
    passengerId,
  } : {
    clientId: +(`${clientId}${divisionCode}`),
    divisionCode,
    dateOfBirth,
    firstName,
    middleName,
    lastName,
    passengerId,
  };

  try {
    const user = await User.findOne({ clientId: +(`${clientId}${divisionCode}`), divisionCode, ...(divisionCode === '299' ? dateOfBirth : {}) });
    if (user) return responseHandler(res, 200, true, Messages.SUCCESS_FETCHING_USER, createJWTToken(user.toObject()));
    const result = user || await UserController.createUserWithDefaultPassword(data);
    if (!result) {
      return responseHandler(res, 400, false, Messages.ERROR_CREATING_USER);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_CREATE_USER, createJWTToken(result.toObject()));
  } catch (error) {
    return next(error);
  }
};

const verifyClient = async (req, res, next) => {
  const clientId = parseInt(req.params.clientId, 10);
  const divisionCode = req.division.code;
  const dateOfBirth = parseInt(req.query.dateOfBirth, 10);
  try {
    // Check if passenger is actually existing
    const passenger = await Passenger.findOne({
      passenger_id: clientId,
      ...(divisionCode === '299' ? {} : { dob: dateOfBirth }),
      division_code: divisionCode,
      is_active: 1,
    });
    if (!passenger) {
      return responseHandler(res, 400, false, Messages.ERROR_CLIENT_NOT_EXISTING);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_CLIENT_VERIFIED, passenger);
  } catch (error) {
    return next(error);
  }
};

const registerUserDevice = async (req, res, next) => {
  const clientId = parseInt(req.params.clientId, 10);
  const divisionCode = req.division.code;
  const { deviceToken } = req.body;
  const devicePlatform = req.headers['x-device-platform'];

  try {
    const checkUser = await User.findOne({ clientId: `${clientId}${divisionCode}`, divisionCode, 'devices.deviceToken': deviceToken });
    if (!checkUser) {
      const registration = await AWS.snsRegisterDevice(deviceToken, devicePlatform);
      if (!registration.success) {
        return responseHandler(res, 400, false, Messages.ERROR_REGISTERING_DEVICE);
      }
      const deviceObject = {
        platform: devicePlatform,
        deviceToken,
        snsARN: registration.data.EndpointArn,
      };
      // update user data
      const user = await User.findOneAndUpdate({ clientId: `${clientId}${divisionCode}`, divisionCode }, { $push: { devices: deviceObject } });
      if (user) {
        return responseHandler(res, 200, true, Messages.SUCCESS_DEVICE_REGISTERED);
      }
      return responseHandler(res, 400, false, Messages.ERROR_REGISTERING_DEVICE);
    }
    await User.findOneAndUpdate(
      { clientId: `${clientId}${divisionCode}`, divisionCode, 'devices.deviceToken': deviceToken },
      { $set: { 'devices.$.isActive': true } },
    );
    return responseHandler(res, 200, true, Messages.SUCCESS_DEVICE_ALREADY_REGISTERED);
  } catch (error) {
    return next(error);
  }
};

const unsubscribeDevice = async (req, res, next) => {
  const clientId = parseInt(req.params.clientId, 10);
  const divisionCode = req.division.code;
  const { deviceToken } = req.body;
  console.log(clientId, divisionCode, deviceToken);
  try {
    await User.findOneAndUpdate(
      { clientId: `${clientId}`, divisionCode, 'devices.deviceToken': deviceToken },
      { $set: { 'devices.$.isActive': false } },
    );
    return responseHandler(res, 200, true, Messages.SUCCESS_DEVICE_UNREGISTERED);
  } catch (error) {
    return next(error);
  }
};

export default {
  nextTrip,
  createUserPassenger,
  verifyClient,
  findOne,
  findOneWithTrips,
  registerUserDevice,
  unsubscribeDevice,
  get,
};
