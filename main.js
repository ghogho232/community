const express = require('express');
const app = express();
var template = require('./template');
var router = require('./routes');

app.use('/',router);

app.listen(3300, () => {
    console.log('Server is running on port 3300');
});