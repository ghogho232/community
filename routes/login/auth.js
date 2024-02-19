var express = require('express');
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');


router.get('/login', function(req,res){
    var title = "로그인";
    var html = template.HTML(title,'',`
        <h2>로그인</h2>
        <form action="/auth/login_process" method="post">
        <p><input type="text" name="user_id" placeholder="아이디"></p>
        <p><input type="password" name="password" placeholder="비밀번호"></p>
        <p><input type="submit" value="로그인"><p>
        </form>
        <p><a href="/auth/register">회원가입</p>
    `, '');
    res.send(html);
});

router.post('/login_process', function(req,res){
    var post = req.body;
    var id = post.user_id;
    var password = post.password;
    console.log(post);
    if(id && password){
        db.query(`SELECT * FROM user WHERE user_id = ? AND password = ?`,[id,password],function(err,results){
            if(err){
                throw err;
            }
            if(results.length>0){
                req.session.is_logined = true;
                req.session.nickname = results[0].name;         
                req.session.save(function(){
                    res.redirect('/');
                });
            } else{
                res.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                            document.location.href="/auth/login";</script>`);    
            }
        });        
    }

});


module.exports=router;