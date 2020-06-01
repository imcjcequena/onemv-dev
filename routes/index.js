// import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

const express = require('express');

const router = express.Router();


router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router;
