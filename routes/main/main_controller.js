var session = require('express-session');
var template = require('../../lib/template');
var auth = require('../../lib/auth_check');
exports.main = (req, res) => {
    var title = 'Community';
    var description = 'this is web community';
    var list = template.list(req.list);
    var html = template.HTML(title, list,
        `<a href="/topic/create">create</a>`,
        `<h2>${title}</h2>${description}<br>`,    
        auth.statusUI(req,res)   
    );
    res.send(html);    
}