const express = require('express');
const router = express.Router();
const controller = require('./main_controller');

router.get('/', controller.main);

module.exports = router;