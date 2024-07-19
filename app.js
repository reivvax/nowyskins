require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');

var apimiddleware = require('./utils/api_key_middleware');

var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var listedItemsRouter = require('./routes/listedItems');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(apimiddleware.apiKeySetterMiddleware);
app.use(apimiddleware.apiKeyMiddleware);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/scripts')));

app.use(session({
    secret: process.env['SESSION_SECRET'],
    resave: false,
    saveUninitialized: false }
));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/listeditems/', listedItemsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error', {user: req.user});
});

module.exports = app;