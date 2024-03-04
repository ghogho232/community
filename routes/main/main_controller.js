const express = require('express');
const app = express();
var session = require('express-session');
var template = require('../../lib/template');
var auth = require('../../lib/auth_check');
var db = require('../../db');

app.use(express.static('public'));

exports.main = (req, res) => {
    var title = 'Welcome';
    var description = 'this is web community';

    db.query(`SELECT * FROM post`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        var posts = result; // 결과값 전체를 가져옴
        var list = template.list(posts);
        var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}<br>`,
            `<a href="/topic/create">글쓰기</a>`,
            auth.statusUI(req, res),
            '',''

        );
    
        res.send(html);
    });
}