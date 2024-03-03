const express = require('express');
const app = express();
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var auth = require('../../lib/auth_check');
var requestIp = require('request-ip');
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json());

router.post('/create_comment',function(req,res){
    var post = req.body;
    var nickname = post.nickname;
    var password = post.password;
    var author_id = post.id;
    var post_id = post.post_id;
    var contents = post.contents;
    db.query(`INSERT INTO comment (post_id,author_id,contents,author_name,password) VALUES (?,?,?,?,?)`,
    [post_id,author_id,contents,nickname,password],function(err,result,fields){
        if(err){
            throw err;
        }
        res.redirect(`/topic/${post_id}`);
    });
});

module.exports = router;