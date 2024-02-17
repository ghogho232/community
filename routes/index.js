const express = require('express');
const router = express.Router();

const main = require('./main/index');
const login = require('./login/auth');

router.use('/', main);
router.use('/login', login);
module.exports = router;