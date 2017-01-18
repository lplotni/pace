/* jshint node: true */
/* jshint esnext: true */
'use strict';

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let flash = require('connect-flash');

let indexRoute = require('./routes/index');
let loginRoute = require('./routes/login');
let logoutRoute = require('./routes/logout');

let registrationRoute = require('./routes/participants/registration');
let participantsRoute = require('./routes/participants/participants');
let editParticipantRoute = require('./routes/participants/editParticipant');

let adminRoute = require('./routes/admin/admin');
let apiRoute = require('./routes/api');
let adminParticipantsRoute = require('./routes/admin/participants');
let adminEditParticipantRoute = require('./routes/admin/editParticipant');
let adminAfterRoute = require('./routes/admin/after');
let adminImportStatementRoute = require('./routes/admin/statement-import');
let paymentValidationRoute = require('./routes/admin/paymentValidation');
let couponcodeRoute = require('./routes/admin/couponcodes');
let resultRoute = require('./routes/results/results');
let certificateRoute = require('./routes/certificate');

let config = require('config');
let csrf = require('csurf');

let app = express();

app.locals.node_env = process.env.NODE_ENV;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.disable("x-powered-by");
app.set('trust proxy',config.get('proxy'));

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('tiny', {
  skip: (req, res) => { return res.statusCode < 400;}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended': true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoute);
app.use("/api", function(err, req, res, next){
  res.status(err.status || 500);
  res.send({
    message: 'Internal Error'
  });
});

// authentication using passport needs to be initialized before the routing setup
app.use(require('express-session')(
    {
        secret: config.get('cookie-secret'),
        signed: true,
        resave: false,
        name: 'pace_session',
        saveUninitialized: false,
        httpOnly: true,
        cookie: {
          secure: config.get('https')
        }
    }));

app.use(csrf());
app.use(function(req, res, next) {
  res.locals._csrf = req.csrfToken();
  next();
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

if (config.get('metrics')) {
  let expressMetrics = require('express-metrics');
  app.use(expressMetrics({
      port: 8091
  }));
}

passport.serializeUser(function (user, done) {
    done(null, {username: user.username, role: user.role});
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        if (username === config.get('admin.username') && password === config.get('admin.password')) {
            let user = {username: 'admin', role: 'admin'};
            return done(null, user);
        } else {
            done(null, false, {message: 'Bitte Benutzername und Passwort überprüfen.'});
        }
    }
));

app.use('/', indexRoute);
app.use('/registration', registrationRoute);
app.use('/participants', participantsRoute);
app.use('/results',resultRoute);
app.use('/certificate',certificateRoute);
app.use('/paymentvalidation', paymentValidationRoute);
app.use('/editparticipant', editParticipantRoute);

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);

app.use('/admin', adminRoute);
app.use('/admin/participants', adminParticipantsRoute);
app.use('/admin/editparticipant', adminEditParticipantRoute);
app.use('/admin/after', adminAfterRoute);
app.use('/admin/couponcodes', couponcodeRoute);
app.use('/admin/import-statements', adminImportStatementRoute);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
