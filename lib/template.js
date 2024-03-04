const express = require('express');
const app = express();
var db = require('../db');
var auth = require('../lib/auth_check');
app.use(express.static('public'));
var template = {
    HTML: function (title, list, body, control, authStatusUI='<a href="/auth/login">로그인</a>',comment,commentcontrol) {
      return `
      <!doctype html>
      <html>
      <head>    
        <title>Login TEST - ${title}</title>
        <link rel="stylesheet" href="/style.css">
        <meta charset="utf-8">
        <style>

        </style>
      </head>
      <body>
        <div class="background">    
          <h1><a href="/">COMMUNITY</a></h1>
          <p>${authStatusUI}</p>
          ${control}
          ${body}
          ${commentcontrol}
          ${comment}
          ${list}
        </div>
      </body>
      </html>
      `;
    },list:function printPost(posts) {
        var list = `<table>
                      <thead>
                          <tr>
                              <th>Title</th>
                              <th>Author</th>
                              <th>created</th>
                          </tr>
                      </thead>
                      <tbody>`;
        
      for (var i = 0; i < posts.length; i++) {
          var post_created = posts[i].post_created;
          var year = post_created.getFullYear();
          var month = ('0' + (post_created.getMonth() + 1)).slice(-2);
          var day = ('0' + post_created.getDate()).slice(-2);
          var date = year + '-' + month  + '-' + day;

          var hours = ('0' + post_created.getHours()).slice(-2); 
          var minutes = ('0' + post_created.getMinutes()).slice(-2);
          var time = hours + ':' + minutes; 
          list += `<tr>
                    <td><a href="/topic/${posts[i].post_id}">${posts[i].title}</a></td>
                    <td>${posts[i].author_name}</td>
                    <td>${date} ${time}</td>
                  </tr>`;
      }   
    list += `</tbody>
        </table>`;
      return list;
  },comment:function printComment(comment) {
    var list = `<table>
                  <thead>

                  </thead>
                  <tbody>`;
    
  for (var i = 0; i < comment.length; i++) {
      var comment_created = comment[i].comment_created;
      var year = comment_created.getFullYear();
      var month = ('0' + (comment_created.getMonth() + 1)).slice(-2);
      var day = ('0' + comment_created.getDate()).slice(-2);
      var date = year + '-' + month  + '-' + day;

      var hours = ('0' + comment_created.getHours()).slice(-2); 
      var minutes = ('0' + comment_created.getMinutes()).slice(-2);
      var time = hours + ':' + minutes; 
      list += `<tr>
                <td>${comment[i].author_name}</td>
                <td>${comment[i].contents}</td>
                <td>${date} ${time}</td>
                <td>
                <form action="/comment/delete_comment" method="post">
                  <input type="hidden" name="post_id" value="${comment[i].post_id}">
                  <input type="hidden" name="comment_id" value="${comment[i].comment_id}">
                  <input type="submit" value="삭제">
                </form>
                </td>
              </tr>`;
  }   
list += `</tbody>
    </table>`;
  return list;
}

}

  module.exports=template;