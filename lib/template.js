const express = require('express');
const app = express();
var db = require('../db');
var auth = require('../lib/auth_check');
app.use(express.static('public'));
var template = {
    HTML: function (title, list, body, control, authStatusUI='<a href="/auth/login">로그인</a>') {
      return `
      <!doctype html>
      <html>
      <head>    
        <title>Login TEST - ${title}</title>
        <link rel="stylesheet" href="/style.css">
        <meta charset="utf-8">
        <style>
          table {
            border: 1px solid black;
          }
          th, td {
            border: 1px solid black;
          }
        </style>
      </head>
      <body>
        <div class="background">
          
          ${authStatusUI}
          ${control}
          ${body}
          ${list}
        </div>
      </body>
      </html>
      `;
    },list:function printPost(title, description, posts, req, res) {
        var list = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                </tr>
            </thead>
            <tbody>`;
      for (var i = 0; i < posts.length; i++) {
          list += `
              <tr>
                  <td><a href="/?id=${posts[i].id}">${posts[i].title}</a></td>
                  <td>${posts[i].author_name}</td>
              </tr>
          `;
      }
    
    list += `
            </tbody>
        </table>
    `;
  
      var html = template.HTML(title, list,
          `<a href="/topic/create">create</a>`,
          `<h2>${title}</h2>${description}<br>`,
          auth.statusUI(req, res)
      );
  
      res.send(html);
  }
  
  }

  module.exports=template;