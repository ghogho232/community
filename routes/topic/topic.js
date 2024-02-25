const express = require('express');
const app = express();
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var auth = require('../../lib/auth_check');

app.use(express.static('public'));

router.get('/create', function(req,res){
  if(!auth.isOwner(req,res)){
    res.redirect('/');
    return false;
  }
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
});

router.post('/create_process', async function(req,res){
  var post = await req.body;
  var title = await post.title;
  var desc = await post.description;
  var name = await req.session.nickname;

  db.query(`SELECT id FROM user WHERE name = ?`,[name],function(err,result){
    if(err){
      throw err;
    }
    var user_id = result[0].id;
    console.log(user_id);
    db.query(`INSERT INTO post (title,contents,post_created,author_id,author_name) VALUES (?,?,?,?,?)`,
            [title,desc,new Date(),user_id,name],function(err,results){
      if(err){
        throw err;
      }
      res.redirect('/');
    });
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
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(post[0].contents, {
          allowedTags:['h1']
          });

          if(!auth.isOwner(req,res)||auth.Owner(req,res)!=author_id){ //자신이 쓴 글이 아니면 글 제어 인터페이스 미출력
            db.query(`SELECT * FROM post`, function (err, result2, fields) {
              var list = template.list(result2);
              var html = template.HTML(sanitizedTitle, list,
              `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div>
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
              `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div><p>${sanitizedDescription}</p>`,
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