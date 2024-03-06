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

router.post('/delete_anony_comment',function(req,res){
    var post = req.body;
    var comment_id = post.comment_id;
    var password = post.password;

    db.query(`SELECT password FROM comment WHERE comment_id=?`, [comment_id], function(err, result, fields){
        if(err){
          throw err;
        }
        if(auth.isOwner(req,res)){
            res.json({ error: '삭제할 수 없습니다' });
        }
        else{
            if(!password){ // 비밀번호 미입력시 입력 요청
                res.json({ error: '비밀번호를 입력하시오.' });
              }
              else if(result.length === 0 || password != result[0].password){
                // 비밀번호가 틀렸으면 클라이언트에 에러 전송
                res.json({ error: '비밀번호가 틀렸습니다.' });
              } else {
                // 비밀번호가 일치하면 게시물 삭제
                db.query(`DELETE FROM comment WHERE comment_id=?`, [comment_id], function(err, result, fields){
                  if(err){
                    throw err;
                  }
                  res.json({ success: '댓글이 삭제되었습니다.' });
                });
              } 
            }

      });
});

router.post('/delete_comment',function(req,res){
    var post = req.body;
    var comment_id = post.comment_id;
    var author_id = post.author_id;
    if(req.session.user_id == author_id){
        db.query(`DELETE FROM comment WHERE comment_id=?`, [comment_id], function(err, result, fields){
            if(err){
              throw err;
            }
            res.json({ success: '게시물이 삭제되었습니다' });
          });
    }
    else{
        res.json({error: '게시물을 지울 수 없습니다'});
    }
});
module.exports = router;