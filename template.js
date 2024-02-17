var template = {
    HTML: function (title, body, authStatusUI) {
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
          ${body}
        </div>
      </body>
      </html>
      `;
    }
  }

  module.exports=template;