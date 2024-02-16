const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/user', (req, res) => {
    const queryData = req.query;
    console.log(queryData);
    res.send('Received query data');
});

app.listen(3300, () => {
    console.log('Server is running on port 3300');
});