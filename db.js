var mysql = require('mysql2');
var db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'whfhd4641!',
    database : 'community'
});
db.connect();

module.exports = db;