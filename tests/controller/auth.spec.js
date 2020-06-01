/* eslint-disable */
import chai from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { Passenger, Trip, User } from '../../models';
import Auth from '../../controller/Auth';
import UserController from '../../controller/Users';
import AuthController from '../../controller/Auth';
import Util, { Messages, getTodayFromDivision, AWS, comparePassword } from '../../util';

const sandbox = sinon.createSandbox();
const { google } = require('googleapis');

// const stub = sandbox.stub(AWS, 'cognitoSignIn').resolves({ success: false, message: 'Sample Error' });

describe('----Auth Controller----', () => {
  describe('getGoogleAuthUrl', () => {
    let req = {};
    let res = {};
    const OAuth2 = google.auth;
    let OAuth2Stub;
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      }
      OAuth2Stub = sinon.stub(OAuth2, 'OAuth2');
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      OAuth2Stub.restore();
    });
    it('should return google auth url', async () => {
      const generateUrlStub = sinon.stub().returns("testUrl") ;
      OAuth2Stub.returns({ generateAuthUrl: generateUrlStub });
      Auth.getGoogleAuthUrl(req, res);
      sandbox.assert.calledOnce(OAuth2Stub);
      sandbox.assert.calledOnce(generateUrlStub)
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_GOOGLE_AUTH_URL }));
    });
    it('should return error when failed', async () => {
      const generateUrlStub = sinon.stub().returns(null) ;
      OAuth2Stub.returns({ generateAuthUrl: generateUrlStub });
      Auth.getGoogleAuthUrl(req, res);
      sandbox.assert.calledOnce(OAuth2Stub);
      sandbox.assert.calledOnce(generateUrlStub)
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status(400).json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_GOOGLE_AUTH_URL }));
    });
    it('should throw error', async () => {
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      OAuth2Stub.throws(fakeError);
      Auth.getGoogleAuthUrl(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  })
  describe('getGoogleToken', () => {
    let req = {};
    let res = {};
    const OAuth2 = google.auth;
    let OAuth2Stub;
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      OAuth2Stub = sinon.stub(OAuth2, 'OAuth2');
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      OAuth2Stub.restore();
    });
    it('should return google token', async () => {
      req.body = { code: 'testCode' };
      const fakeToken = 'testToken';
      const cbStub = sinon.spy()
      const getTokenStub = sinon.stub().returns(cbStub).callsArgWith(1, null, fakeToken);
      OAuth2Stub.returns({ getToken: getTokenStub });
      Auth.getGoogleToken(req, res);
      sandbox.assert.calledOnce(OAuth2Stub);
      sandbox.assert.calledOnce(getTokenStub)
      sandbox.assert.calledWith(getTokenStub, req.body.code)
      sandbox.assert.calledWith(res.status, 200)
      sandbox.assert.calledOnce(res.status(200).json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_GOOGLE_AUTH_TOKEN }));
    });
    it('should return error when failed fetching token', async () => {
      req.body = { code: 'testCode' };
      const fakeToken = 'testToken';
      const googleError = 'test google error';
      const cbStub = sinon.spy()
      const getTokenStub = sinon.stub().returns(cbStub).callsArgWith(1, googleError);
      OAuth2Stub.returns({ getToken: getTokenStub });
      Auth.getGoogleToken(req, res);
      sandbox.assert.calledOnce(OAuth2Stub);
      sandbox.assert.calledOnce(getTokenStub)
      sandbox.assert.calledWith(getTokenStub, req.body.code)
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status(400).json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: `GOOGLE ERROR: ${googleError}` }));
    });
    it('should error when google code is not provided', async () => {
      req.body = {};
      const getTokenStub = sinon.spy();
      OAuth2Stub.returns({ getToken: getTokenStub });
      Auth.getGoogleToken(req, res);
      sandbox.assert.calledOnce(OAuth2Stub);
      sandbox.assert.notCalled(getTokenStub)
      sandbox.assert.calledWith(res.status, 400)
      sandbox.assert.calledOnce(res.status(400).json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_MISSING_PARAMETERS }));
    });
    it('should throw error', async () => {
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      OAuth2Stub.throws(fakeError);
      await Auth.getGoogleToken(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  });
  describe('googleLink', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when user already have google id', async () => {
      const expectedResult = { passengerId: 123456, _id: 'userId', dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const findOneStub = sandbox.stub(User, 'findOne').returns({ ...expectedResult, google: '123123123' });
      await Auth.googleLink(req, res);
      sandbox.assert.calledWith(findOneStub, { google: req.body.providerId });
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_LOGIN_PROVIDER_ALREADY_USE }));
    });
    it('should error when fail on updating user', async () => {
      const expectedResult = { divisionCode: '54', passengerId: 123456, _id: 'userId', dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const findOneStub = sandbox.stub(User, 'findOne').returns(null);
      const findOneAndUpdateStub = sandbox.stub(User, 'findOneAndUpdate').returns(null);
      // const findOneAndUpdateStubb = sandbox.stub(User, 'findOneAndUpdate').returns({ ...expectedResult, google: req.body.providerId })
      await Auth.googleLink(req, res);
      sandbox.assert.calledWith(findOneStub, { google: req.body.providerId });
      sandbox.assert.calledWith(findOneAndUpdateStub, 
        { divisionCode: req.body.divisionCode ,passengerId: req.body.passengerId, dateOfBirth: req.body.dateOfBirth },
        { google: req.body.providerId },
        { new: true }
      );
      sandbox.assert.calledWith(res.status, 400); 
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_LINKING_GOOGLE_ACCOUNT }));
    });
    it('should link google id to mobi user', async () => {
      const expectedResult = { divisionCode: '54', passengerId: 123456, dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const findOneStub = sandbox.stub(User, 'findOne').returns(null);
      const findOneAndUpdateStub = sandbox.stub(User, 'findOneAndUpdate').returns({ toObject: () => expectedResult });
      // const findOneAndUpdateStubb = sandbox.stub(User, 'findOneAndUpdate').returns({ ...expectedResult, google: req.body.providerId })
      await Auth.googleLink(req, res);
      sandbox.assert.calledWith(findOneStub, { google: req.body.providerId });
      sandbox.assert.calledWith(findOneAndUpdateStub, 
        { divisionCode: req.body.divisionCode ,passengerId: req.body.passengerId, dateOfBirth: req.body.dateOfBirth },
        { google: req.body.providerId },
        { new: true }
      );
      sandbox.assert.calledWith(res.status, 200); 
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_LINKING_GOOGLE_ACCOUNT }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.string }));
    });
    it('should throw error', async () => {
      const expectedResult = { divisionCode: '54', passengerId: 123456, dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const findOneStub = sandbox.stub(User, 'findOne').throws(fakeError);
      await Auth.googleLink(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  });
  describe('onemvLink', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when user already have onemv id and onemv email', async () => {
      const expectedResult = { email: 'test@test.com', passengerId: 123456, _id: 'userId', dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const findOneStub = sandbox.stub(User, 'findOne').returns({ ...expectedResult, google: '123123123' });
      await Auth.onemvLink(req, res);
      sandbox.assert.calledWith(findOneStub, { onemv: req.body.providerId, onemvEmail: req.body.email });
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_LOGIN_PROVIDER_ALREADY_USE }));
    });
    it('should error when fail on updating user', async () => {
      const expectedResult = { email: 'test@test.com', divisionCode: '54', passengerId: 123456, _id: 'userId', dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const findOneStub = sandbox.stub(User, 'findOne').returns(null);
      const findOneAndUpdateStub = sandbox.stub(User, 'findOneAndUpdate').returns(null);
      await Auth.onemvLink(req, res);
      sandbox.assert.calledWith(findOneStub, { onemv: req.body.providerId, onemvEmail: req.body.email },);
      sandbox.assert.calledWith(findOneAndUpdateStub, 
        { divisionCode: req.body.divisionCode ,passengerId: req.body.passengerId, dateOfBirth: req.body.dateOfBirth },
        { onemv: req.body.providerId, onemvEmail: req.body.email },
        { new: true }
      );
      sandbox.assert.calledWith(res.status, 400); 
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: Messages.ERROR_LINKING_ONEMV_ACCOUNT }));
    });
    it('should link onemv id and onemv email to mobi user', async () => {
      const expectedResult = { email: 'test@test.com', divisionCode: '54', passengerId: 123456, _id: 'userId', dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const findOneStub = sandbox.stub(User, 'findOne').returns(null);
      const findOneAndUpdateStub = sandbox.stub(User, 'findOneAndUpdate').returns({ toObject: () => expectedResult });
      await Auth.onemvLink(req, res);
      sandbox.assert.calledWith(findOneStub, { onemv: req.body.providerId, onemvEmail: req.body.email },);
      sandbox.assert.calledWith(findOneAndUpdateStub, 
        { divisionCode: req.body.divisionCode ,passengerId: req.body.passengerId, dateOfBirth: req.body.dateOfBirth },
        { onemv: req.body.providerId, onemvEmail: req.body.email },
        { new: true }
      );
      sandbox.assert.calledWith(res.status, 200); 
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_LINKING_ONEMV_ACCOUNT }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.string }));
    });
    it('should throw error', async () => {
      const expectedResult = { email: 'test@test.com', divisionCode: '54', passengerId: 123456, _id: 'userId', dateOfBirth: 12312312, providerId: '123123123' };
      req = { body: expectedResult };
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const findOneStub = sandbox.stub(User, 'findOne').throws(fakeError);
      await Auth.onemvLink(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  });
  describe('onemvSignIn', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when cognito sign in fails', async () => {
      req = { body: { email: "email@test.com", password: '123456' }};
      const fakeError = 'Sample Error'
      const cognitoSignInStub = sandbox.stub(AWS, 'cognitoSignIn').resolves({ success: false, message: fakeError })
      await Auth.onemvSignIn(req, res);
      sandbox.assert.calledWith(cognitoSignInStub, req.body.email, req.body.password);
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: fakeError }));
    });
    it('should sign in using cognito', async () => {
      req = { body: { email: "email@test.com", password: '123456' }};
      const cognitoSignInStub = sandbox.stub(AWS, 'cognitoSignIn').resolves({ success: true, data: {  } })
      await Auth.onemvSignIn(req, res);
      sandbox.assert.calledWith(cognitoSignInStub, req.body.email, req.body.password);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_SIGN_IN_ONEMV_USER }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
    });
    it('should throw error', async () => {
      req = { body: { email: "email@test.com", password: '123456' }};
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const cognitoSignInStub = sandbox.stub(AWS, 'cognitoSignIn').throws(fakeError)
      await Auth.onemvSignIn(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  });
  describe('onemvRegister', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when cognito register fails', async () => {
      req = { body: { email: "email@test.com", password: '123456', firstName: 'fname', middleName: 'mName', lastName: 'lName', phone: '123123', countryCode: '1' }};
      const fakeError = 'Sample Error'
      const cognitoRegisterStub = sandbox.stub(AWS, 'cognitoRegister').resolves({ success: false, message: fakeError })
      await Auth.onemvRegister(req, res);
      sandbox.assert.calledWith(cognitoRegisterStub, req.body.email, req.body.password, req.body.firstName, req.body.middleName, req.body.lastName, req.body.phone, req.body.countryCode);
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: fakeError }));
    });
    it('should register using cognito', async () => {
      req = { body: { email: "email@test.com", password: '123456', firstName: 'fname', middleName: 'mName', lastName: 'lName', phone: '123123', countryCode: '1' }};
      const fakeError = 'Sample Error'
      const cognitoRegisterStub = sandbox.stub(AWS, 'cognitoRegister').resolves({ success: true, data: {} })
      await Auth.onemvRegister(req, res);
      sandbox.assert.calledWith(cognitoRegisterStub, req.body.email, req.body.password, req.body.firstName, req.body.middleName, req.body.lastName, req.body.phone, req.body.countryCode);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_REGISTER_ONEMV_USER }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
    });
    it('should throw error', async () => {
      req = { body: { email: "email@test.com", password: '123456' }};
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const cognitoRegisterStub = sandbox.stub(AWS, 'cognitoRegister').throws(fakeError)
      await Auth.onemvRegister(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  })
  describe('onemvChangePassword', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when cognito change password fails', async () => {
      req = { body: { email: "email@test.com", oldPassword: '123456', newPassword: 'na654312m' }};
      const fakeError = 'Sample Error'
      const cognitoChangePasswordStub = sandbox.stub(AWS, 'cognitoChangePassword').resolves({ success: false, message: fakeError })
      await Auth.onemvChangePassword(req, res);
      sandbox.assert.calledWith(cognitoChangePasswordStub, req.body.email, req.body.oldPassword, req.body.newPassword);
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: fakeError }));
    });
    it('should able to change password', async () => {
      req = { body: { email: "email@test.com", oldPassword: '123456', newPassword: 'na654312m' }};
      const cognitoChangePasswordStub = sandbox.stub(AWS, 'cognitoChangePassword').resolves({ success: true, data: {} })
      await Auth.onemvChangePassword(req, res);
      sandbox.assert.calledWith(cognitoChangePasswordStub, req.body.email, req.body.oldPassword, req.body.newPassword);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ONEMV_CHANGE_PASSWORD }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
    });
    it('should throw error', async () => {
      req = { body: { email: "email@test.com", password: '123456' }};
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const cognitoChangePasswordStub = sandbox.stub(AWS, 'cognitoChangePassword').throws(fakeError)
      await Auth.onemvChangePassword(req, res, next);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  })
  describe('onemvForgotPassword', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when cognito forgot password fails', async () => {
      req = { body: { email: "email@test.com" }};
      const fakeError = 'Sample Error'
      const cognitoForgotPasswordStub = sandbox.stub(AWS, 'cognitoForgotPassword').resolves({ success: false, message: fakeError })
      await Auth.onemvForgotPassword(req, res);
      sandbox.assert.calledWith(cognitoForgotPasswordStub, req.body.email);
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: fakeError }));
    });
    it('should able to change password', async () => {
      req = { body: { email: "email@test.com" }};
      const cognitoForgotPasswordStub = sandbox.stub(AWS, 'cognitoForgotPassword').resolves({ success: true, data: {} })
      await Auth.onemvForgotPassword(req, res);
      sandbox.assert.calledWith(cognitoForgotPasswordStub, req.body.email);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ONEMV_FORGOT_PASSWORD }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
    });
    it('should throw error', async () => {
      req = { body: { email: "email@test.com" }};
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const cognitoForgotPasswordStub = sandbox.stub(AWS, 'cognitoForgotPassword').throws(fakeError)
      await Auth.onemvForgotPassword(req, res, next);
      sandbox.assert.calledWith(cognitoForgotPasswordStub, req.body.email);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  })
  describe('onemvPasswordReset', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      res = {
        status: sinon.stub().returns({ json: sinon.spy() })
      },
      req = {}
      process.env.JWT_SECRET='testKey'
      process.env.JWT_EXP_DURATION='24h'
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXP_DURATION;
    });
    it('should error when cognito reset password fails', async () => {
      req = { body: { newPassword: '123456' }, query: { code: '444555', email: "email@test.com", }};
      const fakeError = 'Sample Error'
      const cognitoPasswordResetStub = sandbox.stub(AWS, 'cognitoPasswordReset').resolves({ success: false, message: fakeError })
      await Auth.onemvPasswordReset(req, res);
      sandbox.assert.calledWith(cognitoPasswordResetStub, req.query.email, req.query.code, req.body.newPassword);
      sandbox.assert.calledWith(res.status, 400);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ success: false }));
      sandbox.assert.calledWith(res.status(400).json, sinon.match({ message: fakeError }));
    });
    it('should able to reset password', async () => {
      req = { body: { newPassword: '123456' }, query: { code: '444555', email: "email@test.com", }};
      const cognitoPasswordResetStub = sandbox.stub(AWS, 'cognitoPasswordReset').resolves({ success: true, data: {} })
      await Auth.onemvPasswordReset(req, res);
      sandbox.assert.calledWith(cognitoPasswordResetStub, req.query.email, req.query.code, req.body.newPassword);
      sandbox.assert.calledWith(res.status, 200);
      sandbox.assert.calledOnce(res.status().json);
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: sinon.match.string }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: sinon.match.bool }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ success: true }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ message: Messages.SUCCESS_ONEMV_RESET_PASSWORD }));
      sandbox.assert.calledWith(res.status(200).json, sinon.match({ data: sinon.match.object }));
    });
    it('should throw error', async () => {
      req = { body: { newPassword: '123456' }, query: { code: '444555', email: "email@test.com", }};
      const fakeError = new Error('Test Error');
      const next = sinon.spy();
      const cognitoPasswordResetStub = sandbox.stub(AWS, 'cognitoPasswordReset').throws(fakeError)
      await Auth.onemvPasswordReset(req, res, next);
      sandbox.assert.calledWith(cognitoPasswordResetStub, req.query.email, req.query.code, req.body.newPassword);
      sandbox.assert.calledOnce(next);
      sandbox.assert.calledWith(next, fakeError);
      sandbox.assert.notCalled(res.status);
    });
  })
});
