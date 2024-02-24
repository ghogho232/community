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
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(post[0].contents, {
          allowedTags:['h1']
          });
          db.query(`SELECT * FROM post`, function (err, result2, fields) {
            var list = template.list(result2);
            var html = template.HTML(sanitizedTitle, list,
            `<div class="post"><h2>${sanitizedTitle}</h2> by ${author}</div><p>${sanitizedDescription}</p>`,
            ` <a href="/topic/create">create</a>
                <a href="/topic/update/${post[0].post_id}">update</a>
                <form action="/topic/delete_process" method="post">
                <input type="hidden" name="title" value="${sanitizedTitle}">
                <input type="submit" value="delete">
                </form>`,
                auth.statusUI(req,res)
            );
            res.send(html);  
          });

      }
  });

  // fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
  //   if(err){
  //     next(err);
  //   }
  //   else{
  //     var title = request.params.pageId;
  //     var sanitizedTitle = sanitizeHtml(title);
  //     var sanitizedDescription = sanitizeHtml(description, {
  //       allowedTags:['h1']
  //     });
  //     var list = template.list(request.list);
  //     var html = template.HTML(sanitizedTitle, list,
  //       `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
  //       ` <a href="/topic/create">create</a>
  //         <a href="/topic/update/${sanitizedTitle}">update</a>
  //         <form action="/topic/delete_process" method="post">
  //           <input type="hidden" name="id" value="${sanitizedTitle}">
  //           <input type="submit" value="delete">
  //         </form>`,
  //         auth.statusUI(request,response)
  //     );
  //     response.send(html);        
  //   } 
  // });
});
module.exports = router;