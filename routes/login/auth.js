var express = require('express');
var router = express.Router();
var db = require('../../lib/db');
var template = require('../../template');


router.get('/', function(req,res){
    var title = "로그인";
    var html = template.HTML(title,`
        <h2>로그인</h2>
        <form action="auth/login_process" method="post">
        <p><input type="text" name="user_id" placeholder="아이디"></p>
        <p><input type="password" name="password" placeholder="비밀번호"></p>
        <p><input type="submit" value="로그인"><p>
        </form>
        <p><a href="/auth/register">회원가입</p>
    `, '');
    res.send(html);
});


module.exports=router;