import ApiKeyController from '../controller/ApiKey';

const express = require('express');

const router = express.Router();


router.get('/generate', ApiKeyController.generateKey);

module.exports = router;
