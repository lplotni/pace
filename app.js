var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var indexRoute = require('./routes/index');
var adminRoute = require('./routes/admin');
var registrationRoute = require('./routes/registration').router;
var participantsRoute = require('./routes/participants');
var paymentValidationRoute = require('./routes/paymentValidation');
var loginRoute = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// authentication using passport needs to be initialized before the routing setup
app.use(require('express-session')({ 
    secret: 'secret pace', 
    resave: false, 
    saveUninitialized: false 
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, {username: user.username, role: user.role});
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        if(username === 'admin' && password === 'admin') {
            var user = {username: "admin", role: "admin"};
            return done(null, user);
        } else {
            done(null, false, { message: 'Bitte Benutzername und Passwort überprüfen.' });
        }
    }
));

app.use('/', indexRoute);
app.use('/admin', adminRoute);
app.use('/registration', registrationRoute);
app.use('/participants', participantsRoute);
app.use('/payment_validation', paymentValidationRoute);
app.use('/login', loginRoute);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
