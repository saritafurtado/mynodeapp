var Activity = require('./models/activities');
var User  = require('../app/models/user');
var Team = require('./models/team');
var Division = require('./models/division');
var slugify = require('slugify');

module.exports = function(app, passport, controllers) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/register', function(req, res) {
        Activity.find({},function(err, docs){
            // render the page and pass in any flash data if it exists
            res.render('register.ejs', { message: req.flash('signupMessage'), allactivity: docs });
        });
    });

    app.post('/register-step1', function(req,res){
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();

        //validate 
        var errors = req.validationErrors();
        if (errors) {
            Activity.find({}, function(err, docs){
                //console.log(docs)
                res.send( { message: errors, allactivity: docs});
            });
        }
        else{
            User.findOne({ 'local.email' :  req.body.email }, function(err, user) {

            // if no user is found, return the message
            if (user){
                Activity.find({}, function(err, docs){
                    res.send({message: 'Email already exists.', allactivity: docs}); // req.flash is the way to set flashdata using connect-flash
                });
            }
            else{
                console.log("here")
                res.send({message: 'success'});
            }

        });
        }
    });
    // process the signup form
    app.post('/register', function(req,res){

        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();

        //validate 
        var errors = req.validationErrors();
        //console.log(errors)
        if (errors) {
            Activity.find({}, function(err, docs){
                //console.log(docs)
                res.send('register.ejs',{ message: errors, allactivity: docs  });
            });
        }
        else{
            passport.authenticate('local-signup',{
                successRedirect:'/dashboard',
                failureRedirect: '/register',
                failureFlash : true  
            })(req,res); // <---- ADDD THIS
        }
    });
        /*passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/register', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }) 
    });*/
    

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('dashboard.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/create-team', isLoggedIn, function(req,res){
        Division.find({}, function(err, docs){
            res.render('createTeam.ejs', {
                user : req.user, // get the user out of session and pass to template
                userActivity: req.user.activities,
                teamClasses: [{value: "M", name: "Men"}, {value: "W", name: "Women"}, {value: "MX", name: "Mixed"}],
                divisions: docs
            });
        });
    });

    app.post('/create-team', function(req,res){
        console.log(req.body.team_name);
        var slug = slugify(req.body.team_name, '-');
        var newTeam = new Team();
        newTeam.team_name = req.body.team_name;
        newTeam.country = req.body.country;
        newTeam.province = req.body.province;
        newTeam.city = req.body.city;
        newTeam.sponsor = req.body.sponsor;
        newTeam.facebook_page_url = req.body.facebook_page_url;
        newTeam.twitter_handle = req.body.twitter_handle;
        newTeam.youtube_link = req.body.youtube_link;
        newTeam.slug = slug;
        newTeam.captain_id = req.user._id;
        newTeam.co_captains = [req.user._id];
        newTeam.save(function(err){
            Team.find({}, function(err, tms) {
                Division.find({}, function(err, docs){
                    res.render('teams.ejs', {
                        user : req.user, // get the user out of session and pass to template
                        teams:tms,
                        divisions: docs
                    });
                });
            });
        })
    });
    
    app.get('/teams', function(req,res) {
        Team.find({}, function(err, tms) {
            Division.find({}, function(err, docs){
                res.render('teams.ejs', {
                    user : req.user, // get the user out of session and pass to template
                    teams:tms,
                    divisions: docs
                });
            });
        });
    });
    

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}