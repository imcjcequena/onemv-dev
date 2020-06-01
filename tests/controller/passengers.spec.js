/* eslint-disable */
import chai from 'chai';
import sinon from 'sinon';
import { Passenger, Trip, User } from '../../models';
import PassengerController from '../../controller/Passengers';
import UserController from '../../controller/Users';
import { Messages, getTodayFromDivision } from '../../util';

const sandbox = sinon.createSandbox();

const fakeDivisionConfig = {
  "_id": "5d27639d3b52ef56e8260ac7",
  "code": 54,
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

describe('----Passenger Controller----', () => {
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
        passenger_card_id: "123",
        first_name: "testname",
        last_name: "lastname",
        passenger_id: 322
      },
      {
        passenger_card_id: "456",
        first_name: "testname123",
        last_name: "lastname123",
        passenger_id: 555
      }
    ];
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
    });
    it('it should return all passengers', async () => {
      sandbox.stub(Passenger, 'find').returns(expectedResult);
      await PassengerController.get(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ALL_PASSENGERS }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: expectedResult }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(Passenger, 'find').returns(expectedResult).throws(error);
      await PassengerController.get(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  })

  describe('findOne', () => {
    let req = {
      headers: {
        'x-division-id': "54"
      },
      body: {},
      params: {
        id: "25360"
      },
      division: fakeDivisionConfig,
    };
    let error = new Error({ error: "Test Error" });
    let res = {};
    let expectedResult = {
      "mobility_aids": [
        "CAN",
        "LFT"
      ],
      "deleted": false,
      "division_id": "54",
      "dob": 19590206,
      "first_name": "ARMANDO",
      "is_para": 1,
      "last_name": "SCOTT",
      "middle_name": "",
      "passenger_card_id": "25360",
      "passenger_id": 88,
      "is_active": 1
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
    it('should return one passenger', async () => {
      sandbox.stub(Passenger, 'findOne').returns(expectedResult);
      await PassengerController.findOne(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_PASSENGER }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', expectedResult));
    })
    it('should error when no passenger found', async () => {
      sandbox.stub(Passenger, 'findOne').returns(null);
      await PassengerController.findOne(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.ERROR_NO_PASSENGER }));
    })
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(Passenger, 'findOne').throws(error);
      await PassengerController.findOne(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  })

  describe('findOneWithTrips', () => {
    let req = {
      headers: {
        'x-division-id': "54"
      },
      body: {},
      query: {},
      params: {
        id: "25360"
      },
      division: fakeDivisionConfig
    };
    let error = new Error({ error: "Test Error" });
    let res = {};
    let expectedResult = [
      {
        "dropoff": {
          "name": "Spohn Physical Therapy",
          "street": "Santa Fe St",
        },
        "pickup": {
          "name": "",
          "street": "Ramsey St",
        },
        "deleted": false,
        "division_id": "54",
        "passenger_id": 312,
        "run_id": null,
        "trip_status": "Scheduled",
        "vehicle_id": null
      },
      {
        "dropoff": {
          "name": "Spohn Physical Therapy",
          "street": "Santa Fe St",
        },
        "pickup": {
          "name": "",
          "street": "Ramsey St",
        },
        "deleted": false,
        "division_id": "54",
        "passenger_id": 312,
        "run_id": null,
        "trip_status": "Scheduled",
        "vehicle_id": null
      },
    ];
    let expectedRecentTripsResult = [
      {
        "dropoff": {
          "name": "Spohn Physical Therapy",
          "street": "Santa Fe St",
        },
        "pickup": {
          "name": "",
          "street": "Ramsey St",
        },
        "deleted": false,
        "division_id": "54",
        "passenger_id": 312,
        "run_id": null,
        "trip_status": "Canceled",
        "vehicle_id": null
      },
      {
        "dropoff": {
          "name": "Spohn Physical Therapy",
          "street": "Santa Fe St",
        },
        "pickup": {
          "name": "",
          "street": "Ramsey St",
        },
        "deleted": false,
        "division_id": "54",
        "passenger_id": 312,
        "run_id": null,
        "trip_status": "Completed",
        "vehicle_id": null
      },
    ];
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.DIVISIONS_API;
      req = {
        headers: {
          'x-division-id': "54"
        },
        body: {},
        query: {},
        params: {
          id: "25360"
        },
        division: fakeDivisionConfig
      };
    });
    it('should return all passenger trips', async () => {
      sandbox.stub(Passenger, 'findOne').returns({});
      sandbox.stub(Trip, 'find').returns(expectedResult);
      process.env.DIVISIONS_API = "http://fakeUrl"
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: "23/07/2019 22:00:00", success: true});
      await PassengerController.findOneWithTrips(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_PASSENGER_TRIP }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', expectedResult));
    })
    it('should return today\'s trip', async () => {
      req.query.filter = {
        'schedule':'today',
        'tripStatus':'Scheduled'
      };
      const fakeTime = "23/07/2019 22:00:00";
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: fakeTime, success: true});
      sandbox.stub(Passenger, 'findOne').returns({});
      // const tripStub = sandbox.stub(Trip, 'find')
      //   .returns(expectedResult);
      const expectedTripsResult = expectedResult.map((item, index) => ({ toObject: () => expectedResult[index] }));
      const tripStub = sandbox.stub(Trip, 'find').returns(expectedTripsResult);
      // const tripStub = sandbox.stub(Trip, 'find').returns([ { toObject: sinon.stub().returns(expectedResult[0]) } ]);
      await PassengerController.findOneWithTrips(req, res);
      sandbox.assert.calledOnce(requestStub);
      sandbox.assert.calledWith(tripStub);
      // sandbox.assert.calledWith(tripStub, { passenger_id: req.params.id, trip_date: fakeTime  })
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_PASSENGER_TRIP }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', expectedResult));
    });
    it('should return future\'s trip', async () => {
      req.query.filter = {
        'schedule':'future'
      };
      req.division.parameters = [ {
        key: "my-trips-lookup-future",
        value: "14",
      }];
      const fakeTime = "23/07/2019 22:00:00";
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: fakeTime, success: true});
      sandbox.stub(Passenger, 'findOne').returns({});
      const tripStub = sandbox.stub(Trip, 'find').returns(expectedResult);
      await PassengerController.findOneWithTrips(req, res);
      sandbox.assert.calledOnce(requestStub);
      sandbox.assert.calledWith(tripStub)
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_PASSENGER_TRIP }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', expectedResult));
    });
    it('should return recent\'s trip', async () => {
      req.query.filter = {
        'schedule':'recent'
      };
      req.division.parameters = [ {
        key: "my-trips-lookup-past",
        value: "14",
      }];
      const fakeTime = "23/07/2019 22:00:00";
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: fakeTime, success: true});
      sandbox.stub(Passenger, 'findOne').returns({});
      const tripStub = sandbox.stub(Trip, 'find').returns(expectedRecentTripsResult);
      await PassengerController.findOneWithTrips(req, res);
      sandbox.assert.calledOnce(requestStub);
      sandbox.assert.calledWith(tripStub)
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_PASSENGER_TRIP }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', expectedRecentTripsResult));
    });
    it('should return empty when no passenger trips found', async () => {
      sandbox.stub(Passenger, 'findOne').returns({});
      sandbox.stub(Trip, 'find').returns([]);
      process.env.DIVISIONS_API = "http://fakeUrl"
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      await PassengerController.findOneWithTrips(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.array }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FIND_PASSENGER_TRIP }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', []));
    })
    it('should return error when no passenger found', async () => {
      sandbox.stub(Passenger, 'findOne').returns(null);
      process.env.DIVISIONS_API = "http://fakeUrl"
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: "23/07/2019 22:00:00", success: true});
      await PassengerController.findOneWithTrips(req, res);
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_NO_PASSENGER }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(Passenger, 'findOne').throws(error);
      await PassengerController.findOneWithTrips(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  })

  describe('verifyClient', () => {
    let req = {
      headers: {
        'x-division-id': '54'
      },
      query: {
        dateOfBirth: 19471229
      },
      params: {
        id: 4025
      },
      division: fakeDivisionConfig,
    };
    let expectedResult = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
    });
    it('should return success and message for verify client', async () => {
      sandbox.stub(Passenger, 'findOne').returns(expectedResult);
      sandbox.stub(User, 'findOne').returns(null);
      await PassengerController.verifyClient(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_CLIENT_VERIFIED }));
    })
    it('should return success: `false` and message for not existing client', async () => {
      sandbox.stub(Passenger, 'findOne').returns(null);
      sandbox.stub(User, 'findOne').returns(null);
      await PassengerController.verifyClient(req, res);
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_CLIENT_NOT_EXISTING }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      sandbox.stub(User, 'findOne').returns(null);
      const next = sinon.spy();
      sandbox.stub(Passenger, 'findOne').throws(error);
      await PassengerController.verifyClient(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  })

  describe('createUserPassnger', () => {
    let req = {
      headers: {
        'x-division-id': '54'
      },
      body: {
        dateOfBirth: 19471229,
        firstName: 'fname',
        middleName: 'mname',
        lastName: 'lname',
        passengerId: 88,
      },
      params: {
        clientId: 4025
      },
      division: fakeDivisionConfig,
    };
    let expectedResult = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should create new user data when user doest not exist', async () => {
      expectedResult = {
        divisionCode: '54',
        clientId: 4025,
        dateOfBirth: 19471229,
        firstName: 'fname',
        middleName: 'mname',
        lastName: 'lname',
        passengerId: 88,
        providerId: "123123",
        provider: "google",
        toObject: sinon.stub().returns({})
      };
      process.env.JWT_SECRET = 'testsecret';
      process.env.JWT_EXP_DURATION = '24h';
      sandbox.stub(User, 'findOne').returns(null);
      const createUserWithDefaultPasswordStub = sandbox.stub(UserController, 'createUserWithDefaultPassword').returns(expectedResult);
      await PassengerController.createUserPassenger(req, res);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledOnce(createUserWithDefaultPasswordStub);
      sandbox.assert.calledWith(createUserWithDefaultPasswordStub, {
        clientId: +(`${req.params.clientId}${req.division.code}`),
        divisionCode: req.division.code,
        dateOfBirth: req.body.dateOfBirth,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        passengerId: req.body.passengerId,
      })
      // sandbox.assert.calledWith(createUserWithDefaultPasswordStub, {
      //   ...req.body,
      //   clientId: req.params.clientId,
      //   divisionCode: req.division.code
      // });
      // sandbox.assert.calledOnce(expectedResult.toObject);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_CREATE_USER }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.string }));
    });
    it('should fetch existing user data', async () => {
      expectedResult = {
        divisionCode: '54',
        clientId: 4025,
        dateOfBirth: 19471229,
        firstName: 'fname',
        middleName: 'mname',
        lastName: 'lname',
        passengerId: '12',
        toObject: sinon.stub().returns({})
      };
      process.env.JWT_SECRET = 'testsecret';
      process.env.JWT_EXP_DURATION = '24h';
      sandbox.stub(User, 'findOne').returns(expectedResult);
      // const createUserWithDefaultPasswordStub = sandbox.stub(UserController, 'createUserWithDefaultPassword').returns(null);
      await PassengerController.createUserPassenger(req, res);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledOnce(expectedResult.toObject);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_FETCHING_USER }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.string }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(User, 'findOne').throws(error);
      await PassengerController.createUserPassenger(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  })

  describe('nextTrip', () => {
    let req = {
      headers: {
        'x-division-id': "54"
      },
      body: {},
      query: {},
      params: {
        id: "25360"
      },
      division: fakeDivisionConfig
    };
    let error = new Error({ error: "Test Error" });
    let res = {};
    let expectedResult = {
      "dropoff": {
        "name": " ",
        "street": "SCOTCH MOSS DR",
        "city": "CORPUS CHRISTI",
        "state": "",
        "zip": 78414,
      },
      "pickup": {
        "start_window": 54000,
        "end_window": 55800,
        "actual_arrival_time": null,
        "actual_departure_time": null
      },
      "deleted": false,
      "division_code": "54",
      "trip_date": 20190722,
      "trip_fare": 1.25,
      "trip_id": 4714705,
      "trip_status": "Scheduled",
    };
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
    it('should return next passenger trips', async () => {
      process.env.DIVISIONS_API = "http://fakeUrl";
      req.division.parameters = [
        {
          key: "lead-time",
          value: "10",
        },
      ];
      sandbox.stub(Trip, 'findOne').returns({ ...expectedResult, toObject: sinon.stub().returns(expectedResult) });
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      await PassengerController.nextTrip(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_NEXT_TRIP_FOUND }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match.has('data', expectedResult));
    })
    it('should return NO next passenger trips', async () => {
      sandbox.stub(Trip, 'findOne').returns(null);
      process.env.DIVISIONS_API = "http://fakeUrl"
      const requestStub = sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { data: 20190723, success: true});
      await PassengerController.nextTrip(req, res);
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_NO_NEXT_TRIP_FOUND }));
    });
    it('it should throw error', async () => {
      const error = new Error('Test Error')
      const next = sinon.spy();
      sandbox.stub(require('request'), 'get').throws(error);
      await PassengerController.nextTrip(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, error);
      sandbox.assert.notCalled(res.status);
    });
  })
});