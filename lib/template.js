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

        </style>
      </head>
      <body>
        <div class="background">    
          <h1><a href="/">COMMUNITY</a></h1>
          <p>${authStatusUI}</p>
          ${control}
          ${body}
          ${list}
        </div>
      </body>
      </html>
      `;
    },list:function printPost(posts) {
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
                  <td><a href="/topic/${posts[i].post_id}">${posts[i].title}</a></td>
                  <td>${posts[i].author_name}</td>
              </tr>
          `;
      }
    
    list += `
            </tbody>
        </table>
    `;
  
      return list;
  }
  
  }

  module.exports=template;