const express = require('express');
const app = express();
var template = require('./lib/template');
var bodyparser = require('body-parser');
var compression = require('compression');
var session = require('express-session');
var helmet = require('helmet');
var csp = require('helmet-csp');
const crypto = require("crypto");
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser');
const flash = require('connect-flash');
var sessionMiddleware = require('./session_control');

app.use(helmet());
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});
app.use(
    csp({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`]
      },
    })
  );
  
app.use(flash());
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json()); //json메세지 파싱
app.use(compression());
app.use(sessionMiddleware);
app.set('view engine' , 'pug');

var router = require('./routes');
var authRouter = require('./routes/login/auth');
var topicRouter = require('./routes/topic/topic');
app.use('/',router);
app.use('/auth', authRouter);
app.use('/topic', topicRouter);

app.listen(3300, '0.0.0.0',() => { console.log('Server is running on port 3300');});