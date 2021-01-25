var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const {
  testAPIConnection,
  testMongoDBConnection,
  insertData,
  getDataByFilter,
} = require('./routes/taskAPI');

// Test case for backend API initialization
var testAPIRouter = require('./routes/taskAPI');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Test case for backend API initialization
app.use('/testAPIConnection', testAPIConnection);
app.use('/testMongoDBConnection', testMongoDBConnection);
app.use('/insertData', insertData);
app.use('/getDataByFilter', getDataByFilter);

mongoose.connect('mongodb+srv://jiazhengyu:Yjz1008936@cluster0.amvan.mongodb.net/test?authSource=admin&replicaSet=atlas-y5wq66-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log('Get error when connecting to MongoDB: ', err)
    } else {
      console.log('MongoDB connected')
    }
  });

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
  res.render('error');
});

module.exports = app;
