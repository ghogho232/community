const express = require('express');
const app = express();
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var auth = require('../../lib/auth_check');
var requestIp = require('request-ip');

app.use(express.static('public'));

router.get('/create', function(req,res){
  if(!auth.isOwner(req,res)){ //익명 글 쓰기
    var ip = requestIp.getClientIp(req);
    var title = 'WEB - create';
    var list = " ";
    var html = template.HTML(title, list, `
      <form action="/topic/anonym_create_process" method="post">
        <p><input type="hidden" name="ip" value="${ip}"></p>
        <p><input type="text" name="title" placeholder="title"></p>
        <p><input type="text" name="name" placeholder="name">
            <input type="password" name="password" placeholder="password"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '',auth.statusUI(req,res));
    res.send(html);
  }
  else{ //로그인 글쓰기
    var title = 'WEB - create';
    var list = " ";
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '',auth.statusUI(req,res));
    res.send(html);  
  }
});

router.post('/create_process', async function(req,res){
  var post = await req.body;
  var title = await post.title;
  var desc = await post.description;
  var nickname = await req.session.nickname;
  
  db.query(`SELECT id FROM user WHERE name = ?`,[nickname],function(err,result){
    if(err){
      throw err;
    }
    var user_id = result[0].id;
    console.log(user_id);
    db.query(`INSERT INTO post (title,contents,post_created,author_id,author_name) VALUES (?,?,?,?,?)`,
            [title,desc,new Date(),user_id,nickname],function(err,results){
      if(err){
        throw err;
      }
      res.redirect('/');
    });
  });
});

router.post('/anonym_create_process', async function(req,res){ //익명 글쓰기
  var post = await req.body;
  var ip = await post.ip;
  const IPIndex = ip.indexOf('.', ip.indexOf('.') + 1); //ip주소 줄이기
  const result = ip.substring(0, IPIndex); //ip주소 두번째까지만 출력
  var title = await post.title;
  var desc = await post.description;
  var name = await post.name;
  name += ' ('+result+')';
  var password = await post.password;
  
  var user_id = 1;
  db.query(`INSERT INTO post (title,contents,post_created,author_id,author_name,post_password) VALUES (?,?,?,?,?,?)`,
          [title,desc,new Date(),user_id,name,password],function(err,results){
    if(err){
      throw err;
    }
    res.redirect('/');
  });
  
});

router.get('/:pageId', function(req, res, next){
  var filteredId = path.parse(req.params.pageId).base;
  db.query(`SELECT * FROM post WHERE post_id=?`,[filteredId],function(err,result,fields){
      if(err){
          next(err);
      }
      else{
          var post = result;      
          var title = post[0].title;
          var author = post[0].author_name;
          var author_id = post[0].author_id;
          console.log("아이디는" + author_id);
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

          if(author_id===1){ //익명글 출력
            console.log('익명');
            db.query(`SELECT * FROM post`, function (err, result2, fields) {
              var list = template.list(result2);
              var html = template.HTML(sanitizedTitle, list,
              `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div>
              ${date} ${time}
              <p>${sanitizedDescription}</p>`,
              ` <a href="/topic/create">글쓰기</a>
                  <a href="/topic/update_auth/${post[0].post_id}">수정</a>
                  <form action="/topic/delete_auth" method="post">
                    <input type="hidden" name="post_id" value="${filteredId}">
                    <input type="hidden" name="title" value="${sanitizedTitle}">
                    <input type="submit" value="삭제">
                  </form>`,
                  auth.statusUI(req,res)
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
                  auth.statusUI(req,res)
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
                  auth.statusUI(req,res)
              );
              res.send(html);  
            });
          }         
      }
  });
});

router.post('/delete_auth',function(req,res){
  var post = req.body;
  var post_id = post.post_id;
  var html = template.HTML('', '',
    ``,
    ` 
        <form action="/topic/delete_auth_process" method="post">
          <p>삭제를 위해 비밀번호를 입력하시오</p>
          <input type="hidden" name="post_id" value="${post_id}">
          <input type="password" name="password" placeholder="비밀번호">
          <input type="submit" value="확인">
        </form>`,
        ''
    );
    res.send(html);
});

// delete_process 핸들러는 비밀번호가 올바른지 확인합니다.
router.post('/delete_auth_process',function(req,res){
  var post = req.body;
  var password = post.password;
  var post_id = post.post_id;
  db.query(`SELECT post_password FROM post WHERE post_id=?`,[post_id],function(err,result,fields){
    if(err){
      throw err;
    }
    if(result.length === 0 || password !== result[0].post_password){
      // 비밀번호가 일치하지 않으면 게시물 페이지로 리디렉션
      req.flash('error', '비밀번호가 틀렸습니다.');
      res.redirect(`/topic/${post_id}`);
    } else {
      // 비밀번호가 일치하면 게시물 삭제
      db.query(`DELETE FROM post WHERE post_id=?`,[post_id],function(err,result,fields){
        if(err){
          throw err;
        }
        res.redirect('/');
      });
    }
  });
});

router.post('/delete_process',function(req,res){
  var post = req.body;
  var post_id = post.post_id;
  console.log(post_id);
  db.query(`DELETE FROM post WHERE post_id=?`,[post_id],function(err,result,fields){
    if(err){
      throw err;
    }
    res.redirect('/');
  });
});

router.get('/update/:pageId', function(req, res) {
  var filteredId = path.parse(req.params.pageId).base;
  db.query(`SELECT * FROM post WHERE post_id=?`, [filteredId], function(err, result, fields) {
    if (err) {
      next(err);
    } else {
      var post = result;
      var title = post[0].title;
      var author = post[0].author_name;
      var author_id = post[0].author_id;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(post[0].contents, {
        allowedTags: ['h1']
      });
      var html = template.HTML(title, '',
        `
          <form action="/topic/update_process" method="post">
            <input type="hidden" name="post_id" value="${filteredId}">
            <p><input type="text" name="title" placeholder="title" value="${sanitizedTitle}"></p>
            <p>
              <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
            </p>
            <p>
              <input type="submit"  value="수정">
          </p>
        </form>
        `,
        ``,
        auth.statusUI(req, res)
      );
      res.send(html);
    }
  });
});

router.post('/update_process',function async (req,res){
  var post = req.body;
  var title = post.title;
  var desc = post.description;
  var post_id = post.post_id;
  db.query(`UPDATE post SET title = ?, contents = ? WHERE post_id=?`,[title,desc,post_id],function(err,results){
    if(err){
      throw err;
    }
    res.redirect('/');
  });
});
module.exports = router;