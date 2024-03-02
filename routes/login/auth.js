var express = require('express');
const app = express();
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');
var auth = require('../../lib/auth_check');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

router.get('/login', function(req,res){
    var title = "로그인";
    var html = 
        `
        <h1><a href ="/">홈</a></h1>
        <h2>로그인</h2>
        <form action="/auth/login_process" method="post">
        <p><input type="text" name="user_id" placeholder="아이디"></p>
        <p><input type="password" name="password" placeholder="비밀번호"></p>
        <p><input type="submit" value="로그인"><p>
        </form>
        <p><a href="/auth/register">회원가입</a></p>` 
        
    res.send(html);
});

router.post('/login_process', async function(req,res){
    var post = await req.body;
    var id = await post.user_id;
    var password = await post.password;
    console.log(post);
    if(id && password){
        db.query(`SELECT * FROM user WHERE user_id = ? AND password = ?`,[id,password],function(err,results){
            if(err){
                throw err;
            }
            if(results.length>0){
                console.log(results[0]);
                req.session.is_logined = true; //로그인 여부
                req.session.nickname = results[0].name; //유저 이름
                req.session.user_id = results[0].id;   //유저 아이디    
                req.session.save(function(){
                    res.redirect('/');
                });
            } else{
                res.send('wrong data');    
            }
        });        
    } else if(!id){
        //아이디를 입력하세요
    } else if(!password){
        //비밀번호를 입력하세요
    }
});

router.get('/register',function(req,res){
    res.render('register');
});

router.post('/id_check',function(req,res){
    var post = req.body;
    var id = post.id;
    db.query(`SELECT user_id FROM user WHERE user_id = ?`,[id],function(err,result,fields){
        if(err){
            throw err;
        }
        if(result.length > 0){
            res.json({ error: '아이디 중복' });
        }
        else{
            res.json({success:'사용가능'});
        }
    });
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
                res.send(`이미 존재하는 아이디입니다.`);
            }
            else if(results.length <= 0 && password == password_check){
                db.query(`INSERT INTO user (name,password,created,user_id) VALUES (?,?,?,?)`,
                [name,password,new Date(),id],function(err,data){
                    if(err){
                        throw err;
                    }                    
                    var home = template.HTML('','',
                    `<h2>${name}님 환영합니다!</h2>
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
    else{
        res.redirect('/auth/register');
    }
});

router.get('/logout',function(req,res){
    req.session.destroy(function(err){
        res.redirect('/');
    })
})

module.exports=router;