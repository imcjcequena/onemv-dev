/* eslint-disable */
import sinon from 'sinon';
import { Passenger, Trip, User, TripRating } from '../../models';
import PassengerController from '../../controller/Passengers';
import UserController from '../../controller/Users';
import TripController from '../../controller/Trip';

import { Messages, getTodayFromDivision } from '../../util';
import { EPERM } from 'constants';

const sandbox = sinon.createSandbox();


const fakeDivisionConfig = {
  "_id": "5d27639d3b52ef56e8260ac7",
  "code": "54",
  "name": "Corpus Christi",
  "support_phone": "(361) 299-4400",
  "parameters": [
    {
      "is_deleted": false,
      "_id": "5d1bd00b136c9107d81191a1",
      "key": "trail-time",
      "value": "15",
      "unit": "minutes",
      "description": "Time after the scheduled drop-off time when the trip is considered imminent",
      "group": "Trip",
      "createdAt": "2019-07-02T21:43:39.190Z",
      "updatedAt": "2019-07-10T21:30:14.749Z",
      "__v": 0,
      "is_default": false
    },
    {
      "is_deleted": false,
      "_id": "5d276ab2c7dc833588911561",
      "key": "lead-time",
      "value": "10",
      "unit": "minutes",
      "description": "Time before the scheduled pick-up time when the trip is considered imminent",
      "group": "Trip",
      "createdAt": "2019-07-11T16:58:26.987Z",
      "updatedAt": "2019-07-11T16:58:26.987Z",
      "__v": 0,
      "is_default": true
    },
    {
      "is_deleted": false,
      "_id": "5d35ee13de1e5861442dad2e",
      "key": "my-trips-lookup-future",
      "value": "14",
      "unit": "days",
      "description": "",
      "group": "Passenger",
      "createdAt": "2019-07-22T17:10:43.979Z",
      "updatedAt": "2019-07-22T17:10:43.979Z",
      "__v": 0,
      "is_default": true
    },
    {
      "is_deleted": false,
      "_id": "5d35ee1cde1e5861442dad2f",
      "key": "my-trips-lookup-past",
      "value": "14",
      "unit": "days",
      "description": "",
      "group": "Passenger",
      "createdAt": "2019-07-22T17:10:52.952Z",
      "updatedAt": "2019-07-22T17:10:52.952Z",
      "__v": 0,
      "is_default": true
    }
  ]
}

describe('----Trip Controller----', () => {
  describe('get', () => {
    let req = {
      headers: {
        'x-division-id': "54"
      },
      body: {},
      query: {},
      division: fakeDivisionConfig,
    };
    let res = {};
    let expectedResult = [
      {
        "dropoff": {
          "name": "Brush Country Center",
          "street": "EVERHART RD",
          "city": "CORPUS CHRISTI",
          "state": "TX",
          "scheduled_time_utc": null,
          "start_window_utc": null,
          "end_window_utc": null
        },
        "pickup": {
          "name": " ",
          "end_window_utc": "2019-07-17T13:30:00.000Z",
          "actual_arrival_time_utc": "2019-07-17T13:33:04.000Z",
          "actual_departure_time_utc": "2019-07-17T13:35:51.000Z",
          "scheduled_time": 28800,
          "start_window": 28800,
          "end_window": 30600,
          "actual_arrival_time": 30784,
          "actual_departure_time": 30951
        },
        "deleted": false,
        "division_code": "54",
        "passenger_id": 437,
        "trip_id": 4711567,
        "trip_status": "Completed",
        "vehicle_id": "188",
        "mobility_aids": ""
      }
    ]
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
      
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.DIVISIONS_API
    });
    it('shoud get all trips with filter', async () => {
      req.query.filter = {
        'trip_status':'Completed',
      }
      process.env.DIVISIONS_API = "http://fakeUrl"
      const fakeOptions = { limit: 0, skip: 0 };
      const findStub = sandbox.stub(Trip, 'find').returns(expectedResult);
      sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      await TripController.get(req, res);
      sandbox.assert.calledWith(findStub,
        { trip_status: req.query.filter.trip_status },
        null,
        fakeOptions,
      );
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ALL_TRIPS }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    });
    it('shoud get all trips with filter and sort', async () => {
      req.query.filter = {
        'trip_status': 'Completed',
      };
      req.query.sort = '-trip_date';

      process.env.DIVISIONS_API = "http://fakeUrl"
      const fakeReturnSplit = [ { trip_date: -1 } ];
      const fakeOptions = { limit: 0, skip: 0, sort: fakeReturnSplit };
      const findStub = sandbox.stub(Trip, 'find').returns(expectedResult);
      sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      await TripController.get(req, res);
      sandbox.assert.calledWith(findStub,
        { trip_status: req.query.filter.trip_status },
        null,
        fakeOptions,
      );
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ALL_TRIPS }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    });
    it('Should get all trips', async () => {
      process.env.DIVISIONS_API = "http://fakeUrl"
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      sandbox.stub(Trip, 'find').returns(expectedResult);
      await TripController.get(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ALL_TRIPS }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    });
    it('it should throw error', async () => {
      process.env.DIVISIONS_API = "http://fakeUrl"
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(Trip, 'find').returns(expectedResult).throws(error);
      await TripController.get(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  });
  describe('findOne', () => {
    let req = {
      headers: {
        'x-division-id': "54"
      },
      body: {},
      query: {},
      params: {
        id: 4711567
      },
      division: fakeDivisionConfig,
    };
    let res = {};
    let expectedResult = {
      "dropoff": {
        "name": "Brush Country Center",
        "street": "EVERHART RD",
        "city": "CORPUS CHRISTI",
        "state": "TX",
        "scheduled_time_utc": null,
        "start_window_utc": null,
        "end_window_utc": null
      },
      "pickup": {
        "name": " ",
        "end_window_utc": "2019-07-17T13:30:00.000Z",
        "actual_arrival_time_utc": "2019-07-17T13:33:04.000Z",
        "actual_departure_time_utc": "2019-07-17T13:35:51.000Z",
        "scheduled_time": 28800,
        "start_window": 28800,
        "end_window": 30600,
        "actual_arrival_time": 30784,
        "actual_departure_time": 30951
      },
      "deleted": false,
      "division_code": "54",
      "passenger_id": 437,
      "trip_id": 4711567,
      "trip_status": "Completed",
      "vehicle_id": "188",
      "mobility_aids": ""
    }
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.DIVISIONS_API
    });
    it('Should get one trip', async () => {
      process.env.DIVISIONS_API = "http://fakeUrl"
      sandbox.stub(Trip, 'findOne').returns({ ...expectedResult, toObject: sinon.stub().returns(expectedResult) });
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190717, success: true});
      await TripController.findOne(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_TRIP }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    })
    it('should error when no trip found', async () => {
      sandbox.stub(Trip, 'findOne').returns(null);
      await TripController.findOne(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.ERROR_NO_TRIPS_FOUND }));
    })
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(Trip, 'findOne').throws(error);
      await TripController.findOne(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  });

  describe('createTripRatings', () => {
    let req = {
      headers: {
      },
      body: {
        passengerId: 312,
        rating: 2,
        comment: 'test comment'
      },
      query: {},
      params: {
        id: 4711567
      }
    };
    let res = {};
    let expectedResult = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
    });
    it('should return error when no trip found', async () => {
      sandbox.stub(Trip, 'findOne').returns(null);
      await TripController.createTripRatings(req, res);
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_NO_TRIPS_FOUND }));
    });
    it('should create new TripRating when no trip ratings found', async () => {
      expectedResult = {
        tripId: req.params.id,
        ratings: [{
          passengerId: req.body.passengerId,
          rating: req.body.rating,
          comment: req.body.comment,
        }]
      };
      sandbox.stub(Trip, 'findOne').returns({});
      sandbox.stub(TripRating, 'findOne').returns(null);
      sandbox.stub(TripRating, 'create').returns(expectedResult);
      await TripController.createTripRatings(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_TRIP_RATING_CREATED }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.has('ratings') }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.has('ratings', sinon.match.array) }));
    });
    it('should error when passenger already rated', async () => {
      expectedResult = {
        tripId: req.params.id,
        ratings: [{
          passengerId: req.body.passengerId,
          rating: req.body.rating,
          comment: req.body.comment,
        }]
      };
      sandbox.stub(Trip, 'findOne').returns({});
      sandbox.stub(TripRating, 'findOne').returns(expectedResult);
      await TripController.createTripRatings(req, res);
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_PASSENGER_ALREADY_RATED }));
    });
    it('should update existing TripRating', async () => {
      expectedResult = {
        tripId: req.params.id,
        ratings: [
          {
            passengerId: 111,
            rating: 4,
            comment: "test comment",
          },
          {
            passengerId: req.body.passengerId,
            rating: req.body.rating,
            comment: req.body.comment,
          }
        ]
      };
      sandbox.stub(Trip, 'findOne').returns({});
      sandbox.stub(TripRating, 'findOne').returns({
        tripId: req.params.id,
        ratings: [{
          passengerId: 111,
          rating: 4,
          comment: "test comment",
        }]
      });
      sandbox.stub(TripRating, 'findOneAndUpdate').returns(expectedResult);
      await TripController.createTripRatings(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.SUCCESS_TRIP_RATING_CREATED }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.has('ratings') }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.has('ratings', sinon.match.array) }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(Trip, 'findOne').throws(error);
      await TripController.createTripRatings(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  });

  describe('getRatings', () => {
    let req = {
      headers: {
      },
      body: {},
      query: {},
      params: {
        id: 4711567
      }
    };
    let res = {};
    let expectedResult = {
      "tripId": 4711567,
      "ratings": [
        {
          "deleted": false,
          "_id": "5d370d66b261770721f8c210",
          "passengerId": 311,
          "rating": 2,
          "createdAt": "2019-07-23T14:07:03.176Z",
          "updatedAt": "2019-07-23T14:07:03.176Z"
        },
        {
          "deleted": false,
          "_id": "5d371487d623e335b141354a",
          "passengerId": 310,
          "rating": 2,
          "updatedAt": "2019-07-23T14:07:03.176Z",
          "createdAt": "2019-07-23T14:07:03.176Z"
        }
      ],
      "createdAt": "2019-07-23T13:36:38.383Z",
      "updatedAt": "2019-07-23T14:07:03.176Z",
      "__v": 0
    };
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
    });
    it('should get all trip ratings', async () => {
      sandbox.stub(TripRating, 'findOne').returns(expectedResult);
      await TripController.getRatings(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_TRIP_RATINGS }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    });
    it('should error when no trips', async () => {
      sandbox.stub(TripRating, 'findOne').returns(null);
      await TripController.getRatings(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.ERROR_NO_TRIPS_FOUND }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(TripRating, 'findOne').throws(error);
      await TripController.getRatings(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  });
});