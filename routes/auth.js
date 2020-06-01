
import { body } from 'express-validator';
import { validationHandler } from '../util';
import AuthController from '../controller/Auth';

const express = require('express');

const router = express.Router();

router.get(
  '/google/authUrl',
  AuthController.getGoogleAuthUrl,
);

router.post(
  '/google/register',
  [
    body('code').exists().not().isEmpty(),
  ],
  validationHandler,
  AuthController.getGoogleToken,
);


router.post('/onemv/register', AuthController.onemvRegister);

router.post('/google/link', AuthController.googleLink);

router.post('/onemv/signIn', AuthController.onemvSignIn);

router.post('/onemv/register', AuthController.onemvRegister);

router.post('/onemv/changePassword', AuthController.onemvChangePassword);

router.post('/onemv/link', AuthController.onemvLink);

router.post('/onemv/forgotPassword', AuthController.onemvForgotPassword);

router.post('/onemv/passwordReset', AuthController.onemvPasswordReset);

module.exports = router;
