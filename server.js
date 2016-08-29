// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var expressValidator = require('express-validator');
var session      = require('express-session');
var $ = require('jQuery')
var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect('mongodb://localhost/nodedb'); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
  extended: true
})); // get information from html forms
app.use(expressValidator());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ 
	secret: 'ilovescotchscotchyscotchscotch',
	resave: true ,
	saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//This will make a user variable available in all templates
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.use(express.static(__dirname + '/public'));

// Executed when the incoming request is not matching any route
/*app.use("*",function(req,res){ 
  res.sendFile(path + "404.html");
});*/

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);