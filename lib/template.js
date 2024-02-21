var template = {
    HTML: function (title, list, body, control, authStatusUI='<a href="/auth/login">로그인</a>') {
      return `
      <!doctype html>
      <html>
      <head>    
        <title>Login TEST - ${title}</title>
        <meta charset="utf-8">
        <style>

      </style>
      </head>
      <body>
        <div class="background">
          
          ${authStatusUI}
          ${list}
          ${body}
          ${control}

        </div>
      </body>
      </html>
      `;
    },list:function(filelist){
      return `<br>`
  }
  }

  module.exports=template;