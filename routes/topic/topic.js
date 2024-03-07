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
const pagePrint = require('./page_controller');
//const urlCheck = require('../../lib/Url_check');

app.use(express.static('public'));
app.use(bodyParser.json());
//app.use(urlCheck.restrictUrlAccess);

router.get('/create', function(req,res){
  if(!auth.isOwner(req,res)){ //익명 글 쓰기
    var ip = requestIp.getClientIp(req);
    var title = 'WEB - create';
    var list = " ";
    var html = template.HTML(title, list, `
      <form action="/topic/anonym_create_process" method="post">
        <p><input type="hidden" name="ip" value="${ip}"></p>
        <p><input type="text" name="title" placeholder="제목"></p>
        <p><input type="text" name="name" placeholder="닉네임">
            <input type="password" name="password" placeholder="비밀번호"></p>
        <p>
          <textarea name="description" placeholder="내용"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '',auth.statusUI(req,res),``,``
    );
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
    `, '',auth.statusUI(req,res),``,``);
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

router.get('/:pageId', pagePrint.main);

// delete_auth 라우팅은 비밀번호 입력 폼을 렌더링합니다.
router.post('/delete_auth', function(req, res){
  var post = req.body;
  var post_id = post.post_id;
  res.render('delete_auth', { post_id: post_id });
});
 
// 비밀번호 맞는지 확인
router.post('/delete_auth_process', function(req, res){
  var post = req.body;
  var password = post.password;
  var post_id = post.post_id;
  db.query(`SELECT post_password FROM post WHERE post_id=?`, [post_id], function(err, result, fields){
    if(err){
      throw err;
    }
    if(!password){ // 비밀번호 미입력시 입력 요청
      res.json({ error: '비밀번호를 입력하시오.' });
    }
    else if(result.length === 0 || password != result[0].post_password){
      // 비밀번호가 틀렸으면 클라이언트에 에러 전송
      res.json({ error: '비밀번호가 틀렸습니다.' });
    } else {
      // 비밀번호가 일치하면 게시물 삭제
      db.query(`DELETE FROM post WHERE post_id=?`, [post_id], function(err, result, fields){
        if(err){
          throw err;
        }
        res.json({ success: '게시물이 삭제되었습니다.' });
      });
    }
  });
});


router.post('/delete_process',function(req,res){
  var post = req.body;
  var post_id = post.post_id;
  db.query(`DELETE FROM post WHERE post_id=?`,[post_id],function(err,result,fields){
    if(err){
      throw err;
    }
    res.redirect('/');
  });
});

router.post('/update_auth/:pageId', function(req, res) {
  var post = req.body;
  var post_id = post.post_id;
  res.render('update_auth', { post_id: post_id });
});

router.post('/update_auth_process', function(req,res){
  var post = req.body;
  var password = post.password;
  var post_id = post.post_id;
  db.query(`SELECT post_password FROM post WHERE post_id=?`, [post_id], function(err, result, fields){
    if(err){
      throw err;
    }
    if(!password){ // 비밀번호 미입력시 입력 요청
      res.json({ error: '비밀번호를 입력하시오.' });
    }
    else if(result.length === 0 || password != result[0].post_password){
      // 비밀번호가 틀렸으면 클라이언트에 에러 전송
      res.json({ error: '비밀번호가 틀렸습니다.' });
    } else {
      // 비밀번호가 일치하면 게시물 수정 가능
        req.session.can_update = true;
        res.json({ success: '' });

    }
  });
});

router.get('/update/:pageId', function(req, res) {
  var filteredId = path.parse(req.params.pageId).base;
  db.query(`SELECT * FROM post WHERE post_id=?`,[filteredId],function(err,result,fields){
    if (err) {
      throw(err);
    }
    if(result[0].author_id == req.session.user_id || req.session.can_update){ //해당글쓴이거나 익명글 비밀번호 맞았을 시 수정가능
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
        auth.statusUI(req, res),
        ``,``
      );
      req.session.destroy(function(err){ //다른 글 수정 방지 위해 바로 수정 허가 세션 삭제
        res.send(html);
      });  
      
    }
    else { //아니면 수정불가
      res.redirect('/');
    }
    })
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
    req.session.destroy(function(err){
      res.redirect(`${post_id}`);
    });  
  });
});


module.exports = router;