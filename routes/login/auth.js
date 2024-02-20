var express = require('express');
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');
var auth = require('../../lib/auth_check');

router.get('/login', function(req,res){
    var title = "로그인";
    var html = 
        `<h2>로그인</h2>
        <form action="/auth/login_process" method="post">
        <p><input type="text" name="user_id" placeholder="아이디"></p>
        <p><input type="password" name="password" placeholder="비밀번호"></p>
        <p><input type="submit" value="로그인"><p>
        </form>
        <p><a href="/auth/register">회원가입</p>` 
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
                res.send('wrong data');    
            }
        });        
    }
});
var title = "회원가입";
var html = template.HTML(title,'',`
    <h2>회원가입</h2>
    <form action="/auth/register_process" method="post">
    <p><input type="text" name="user_id" placeholder="아이디">
    <input type="button" value="중복확인">
    </p>
    <p><input type="password" name="password" placeholder="비밀번호"></p>
    <p><input type="password" name="password_check" placeholder="비밀번호 확인"></p>
    <p><input type="text" name="name" placeholder="닉네임">
    <p><input type="submit" value="로그인"><p>
    </form>
`, '');
router.get('/register',function(req,res){
    res.send(html);
});

router.post('/register_process', function(req,res){
    var post = req.body;
    var id = post.user_id;
    var password = post.password;
    var password_check = post.password_check;
    var name = post.name;

    if(id && password && password_check && name){
        db.query(`SELECT * FROM user WHERE user_id = ?`,[id], function(err, results){
            console.log(results);
            if(err){
                throw err;
            }
            if(results.length > 0){
                res.send(html+`이미 존재하는 아이디입니다.`);
            }else if(results.length <= 0 && password == password_check){
                db.query(`INSERT INTO user (name,password,created,user_id) VALUES (?,?,?,?)`,
                [name,password,new Date(),id],function(err,data){
                    if(err){
                        throw err;
                    }                    
                    var home = template.HTML('','',
                    name + `<h2>님 환영합니다!</h2>
                    <form action="/" method="get">
                        <p><input type="submit" value="홈으로">`
                    ,'','');
                    res.send(home);
                });   
            }else{
                res.send(html+`비밀번호가 일치하지 않습니다.`);
            }
        });
    }
});

router.get('/logout',function(req,res){
    req.session.destroy(function(err){
        res.redirect('/');
    })
})

module.exports=router;