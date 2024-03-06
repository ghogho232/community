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

exports.main = function(req, res, next){
    var filteredId = path.parse(req.params.pageId).base;
    console.log(req.session.user_id);
    db.query(`SELECT * FROM post WHERE post_id=?`,[filteredId],function(err,result,fields){
        if(err){
            next(err);
        }
        else{
            var post = result;      
            var title = post[0].title;
            var author = post[0].author_name;
            var author_id = post[0].author_id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(post[0].contents, {
            allowedTags:['h1']
            });
            var post_created = post[0].post_created;
            var year = post_created.getFullYear();
            var month = ('0' + (post_created.getMonth() + 1)).slice(-2);
            var day = ('0' + post_created.getDate()).slice(-2);
            var date = year + '-' + month  + '-' + day;
  
            var hours = ('0' + post_created.getHours()).slice(-2); 
            var minutes = ('0' + post_created.getMinutes()).slice(-2);
            var time = hours + ':' + minutes; 
            var written_time = date + ' ' + time;
            db.query(`SELECT * FROM comment WHERE post_id=?`,[filteredId],function(err,result3,fields){
              var comments = template.comment(result3);
              var commentControl
              if(!auth.isOwner(req,res)){ //로그아웃시 댓글 컨트롤러
                commentControl = `               
                <br>
                <hr>
                <form action="/comment/create_comment" method="post">
                  <input type="hidden" name="id" value="1">
                  <input type="hidden" name="post_id" value="${filteredId}">
                  <p><input type="text" name="nickname" placeholder="닉네임" required>
                  <input type="password" name="password" placeholder="비밀번호" required></p>
                  <p>
                    <textarea name="contents" placeholder="댓글입력" required></textarea>
                  </p>
                  <p>
                    <input type="submit" value="등록">
                  </p>
                </form>`
              }else{ //로그인 시 댓글 컨트롤러
                commentControl = `               
                <br>
                <hr>
                <form action="/comment/create_comment" method="post">
                  <input type="hidden" name="id" value=${req.session.user_id}>
                  <input type="hidden" name="post_id" value="${filteredId}">
                  <p><input type="text" name="nickname" value=${req.session.nickname} readonly required>
                  <p>
                    <textarea name="contents" placeholder="댓글입력" required></textarea>
                  </p>
                  <p>
                    <input type="submit" value="등록">
                  </p>
                </form>`
              }
              
  
              if(author_id===1){ //익명글 출력
                db.query(`SELECT * FROM post`, function (err, result2, fields) {
                  var list = template.list(result2);
                  var html = template.HTML(sanitizedTitle, list,
                  `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div>
                  ${date} ${time}
                  <p>${sanitizedDescription}</p>`,
                  ` <a href="/topic/create">글쓰기</a>
                        <form action="/topic/update_auth/${post[0].post_id}" method="post">
                            <input type="hidden" name="post_id" value="${filteredId}">
                            <input type="hidden" name="title" value="${sanitizedTitle}">
                            <input type="submit" value="수정">
                        </form>
                        <form action="/topic/delete_auth" method="post">
                            <input type="hidden" name="post_id" value="${filteredId}">
                            <input type="hidden" name="title" value="${sanitizedTitle}">
                            <input type="submit" value="삭제">
                        </form>`,
                        auth.statusUI(req,res),
                  `
                  <h4>댓글</h4> 
                    ${comments}
                    <br>
                    <hr>
                    <br>
                  `,
                  commentControl
    
                  );
                  res.send(html);
                });
              }
    
              else if(!auth.isOwner(req,res)||auth.Owner(req,res)!=author_id){ //자신이 쓴 글이 아니면 글 제어 인터페이스 미출력
                db.query(`SELECT * FROM post`, function (err, result2, fields) {
                  var list = template.list(result2);
                  var html = template.HTML(sanitizedTitle, list,
                  `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div>
                    ${date} ${time}
                   <p>${sanitizedDescription}</p>`,
                  `<a href="/topic/create">글쓰기</a>`,
                      auth.statusUI(req,res),
                      `
                  <h4>댓글</h4> 
                    ${comments}
                    <br>
                    <hr>
                    <br>
                  `,
                    commentControl
                  );
                  res.send(html);  
                });
              }
              
              else{ //자신이 쓴 글이면 제어 가능
                db.query(`SELECT * FROM post`, function (err, result2, fields) {
                  var list = template.list(result2);
                  var html = template.HTML(sanitizedTitle, list,
                  `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div>
                  ${date} ${time}
                  <p>${sanitizedDescription}</p>`,
                  ` <a href="/topic/create">글쓰기</a>
                      <a href="/topic/update/${post[0].post_id}">수정</a>
                      <form action="/topic/delete_process" method="post">
                        <input type="hidden" name="post_id" value="${filteredId}">
                        <input type="hidden" name="title" value="${sanitizedTitle}">
                        <input type="submit" value="삭제">
                      </form>`,
                      auth.statusUI(req,res),
                      `
                  <h4>댓글</h4> 
                    ${comments}
                    <br>
                    <hr>
                    <br>
                  `,
                  commentControl
                  );
                  res.send(html);  
                });
              }        
            });
  
            
             
        }
    });
  }