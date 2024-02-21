const express = require('express');
const app = express();
var template = require('./lib/template');
var bodyparser = require('body-parser');
var compression = require('compression');
var session = require('express-session');
var helmet = require('helmet');
var csp = require('helmet-csp');
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser');

var sessionMiddleware = require('./session_control');

app.use(helmet());
app.use(
    csp({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    })
  );
  

app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended: false}));
app.use(compression());
app.use(sessionMiddleware);

var router = require('./routes');
var authRouter = require('./routes/login/auth');
var topicRouter = require('./routes/topic/topic');
app.use('/',router);
app.use('/auth', authRouter);
app.use('/topic', topicRouter);

app.listen(3300, () => { console.log('Server is running on port 3300');});