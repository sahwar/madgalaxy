var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes_api_v1 = require('./routes/routes_api_v1');
var basic_routes = require('./routes/basic_routes');
var error_handler_routes = require('./routes/error_handler');
var debug = require('debug')('');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', routes_api_v1); //all routes for /api/v1
app.use('/', basic_routes); //any other route
app.use('', error_handler_routes); //if not routed by above handlers, throw an error

module.exports = app;