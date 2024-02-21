var express = require('express');
var router = express.Router();
var db = require('../../db');
var template = require('../../lib/template');
var auth = require('../../lib/auth_check');

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

module.exports = router;