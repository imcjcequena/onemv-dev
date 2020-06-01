
import {
  responseHandler,
  Messages,
  AWS,
  createJWTToken,
} from '../util';
import { User } from '../models';

const { google } = require('googleapis');

// eslint-disable-next-line consistent-return
const getGoogleAuthUrl = (req, res, next) => {
  try {
    const oAuthClient = new google.auth.OAuth2(process.env.GOOGLE_ID, process.env.GOOGLE_SECRET, process.env.GOOGLE_REDIRECT_URI);
    const url = oAuthClient.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      prompt: 'select_account',
      // If you only need one scope you can pass it as a string
      scope: ['https://www.googleapis.com/auth/plus.me', 'profile email'],
    });
    if (!url) {
      return responseHandler(res, 400, false, Messages.ERROR_GOOGLE_AUTH_URL);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_GOOGLE_AUTH_URL, url);
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const getGoogleToken = (req, res, next) => {
  try {
    const oAuthClient = new google.auth.OAuth2(process.env.GOOGLE_ID, process.env.GOOGLE_SECRET, process.env.GOOGLE_REDIRECT_URI);
    const { code } = req.body;

    if (!code) {
      return responseHandler(res, 400, false, Messages.ERROR_MISSING_PARAMETERS);
    }

    oAuthClient.getToken(code, (error, token) => {
      if (error) {
        return responseHandler(res, 400, false, `GOOGLE ERROR: ${error}`);
      }
      return responseHandler(res, 200, true, Messages.SUCCESS_GOOGLE_AUTH_TOKEN, token);
    });
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const googleLink = async (req, res, next) => {
  const passengerId = parseInt(req.body.passengerId, 10);
  const dateOfBirth = parseInt(req.body.dateOfBirth, 10);
  const {
    providerId,
    divisionCode,
  } = req.body;
  try {
    // Check if some user already taken the id
    const existingUser = await User.findOne({ google: providerId });

    if (existingUser) return responseHandler(res, 400, false, Messages.ERROR_LOGIN_PROVIDER_ALREADY_USE);

    let user;
    if (!dateOfBirth) {
      user = await User.findOneAndUpdate({ passengerId, divisionCode }, { google: providerId }, { new: true });
    } else {
      user = await User.findOneAndUpdate({ passengerId, dateOfBirth, divisionCode }, { google: providerId }, { new: true });
    }

    if (!user) {
      return responseHandler(res, 400, false, Messages.ERROR_LINKING_GOOGLE_ACCOUNT);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_LINKING_GOOGLE_ACCOUNT, createJWTToken(user.toObject()));
  } catch (error) {
    next(error);
  }
};


// eslint-disable-next-line consistent-return
const onemvRegister = async (req, res, next) => {
  const {
    email,
    password,
    firstName,
    middleName,
    lastName,
    phone,
    countryCode,
  } = req.body;
  try {
    const result = await AWS.cognitoRegister(email, password, firstName, middleName, lastName, phone, countryCode);
    if (result.success === false) {
      return responseHandler(res, 400, false, result.message);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_REGISTER_ONEMV_USER, result);
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const onemvSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AWS.cognitoSignIn(email, password);
    if (result.success === false) {
      return responseHandler(res, 400, false, result.message);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_SIGN_IN_ONEMV_USER, result.data);
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const onemvLink = async (req, res, next) => {
  const passengerId = parseInt(req.body.passengerId, 10);
  const dateOfBirth = parseInt(req.body.dateOfBirth, 10);
  const {
    providerId,
    email,
    divisionCode,
  } = req.body;
  try {
    // Check if some user already taken the id
    const existingUser = await User.findOne({ onemv: providerId, onemvEmail: email });

    if (existingUser) return responseHandler(res, 400, false, Messages.ERROR_LOGIN_PROVIDER_ALREADY_USE);

    let user;

    if (!dateOfBirth) {
      user = await User.findOneAndUpdate({ passengerId, divisionCode }, { onemv: providerId, onemvEmail: email }, { new: true });
    } else {
      user = await User.findOneAndUpdate({ passengerId, dateOfBirth, divisionCode }, { onemv: providerId, onemvEmail: email }, { new: true });
    }
    if (!user) {
      return responseHandler(res, 400, false, Messages.ERROR_LINKING_ONEMV_ACCOUNT);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_LINKING_ONEMV_ACCOUNT, createJWTToken(user.toObject()));
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const onemvChangePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, email } = req.body;
    const result = await AWS.cognitoChangePassword(email, oldPassword, newPassword);
    if (result.success === false) {
      return responseHandler(res, 400, false, result.message);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_ONEMV_CHANGE_PASSWORD, result);
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const onemvForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await AWS.cognitoForgotPassword(email);
    if (result.success === false) {
      return responseHandler(res, 400, false, result.message);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_ONEMV_FORGOT_PASSWORD, result.data);
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line consistent-return
const onemvPasswordReset = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { code, email } = req.query;
    const result = await AWS.cognitoPasswordReset(email, code, newPassword);
    if (result.success === false) {
      return responseHandler(res, 400, false, result.message);
    }
    return responseHandler(res, 200, true, Messages.SUCCESS_ONEMV_RESET_PASSWORD, result.data);
  } catch (error) {
    next(error);
  }
};


export default {
  onemvPasswordReset,
  onemvForgotPassword,
  getGoogleAuthUrl,
  getGoogleToken,
  onemvRegister,
  onemvSignIn,
  onemvChangePassword,
  onemvLink,
  googleLink,
};
