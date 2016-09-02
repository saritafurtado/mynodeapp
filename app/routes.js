var Activity = require('./models/activities');
var User  = require('../app/models/user');
var Team = require('./models/team');
var TeamMembers = require('./models/teamMembers');
var Division = require('./models/division');
var slugify = require('slugify');
var _ = require('underscore');
module.exports = function(app, passport) {

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
        Team.find({"co_captains": { $in:[req.user._id] } }, function(err, myt){ 
            res.render('dashboard.ejs', {
                user : req.user, // get the user out of session and pass to template
                myTeams: myt
            });
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
        var slug = slugify(req.body.team_name, '-');
        var classes = [];
        var m_divisions = req.body.M_team_divisions;
        var w_divisions = req.body.W_team_divisions;
        var mx_divisions = req.body.MX_team_divisions;
        
        if (m_divisions.length) {
            classes.push('M');
        }
        var w_divisions = req.body.W_team_divisions;
        if (w_divisions.length) {
            classes.push('W');
        }
        var mx_divisions = req.body.MX_team_divisions;
        if (mx_divisions.length) {
            classes.push('MX');
        }
        var class_divisions = []; 
        var newTeam = new Team();
        var teamMembers = new TeamMembers();
        if (classes.length) {
            classes.forEach(function(val){
                if(val=="M" && m_divisions.length >0 ){
                    class_divisions.push({
                        "class":val,
                        "div":m_divisions
                    });
                }
                if(val=="W" && w_divisions.length>0){
                    class_divisions.push({
                        "class":val,
                        "div":w_divisions
                    })
                }
                if(val=="MX"  && mx_divisions.length>0){
                    class_divisions.push({
                        "class":val,
                        "div":mx_divisions
                    })
                }
            });
        }
        
        var array3 = m_divisions.concat(w_divisions);
        var all_divs = array3.concat(mx_divisions);
        var divisions = [];    
        all_divs.forEach(function(div){
            
            if(divisions.indexOf(div) === -1) 
                divisions.push(div);
        });
        
        newTeam.captain_id = req.user._id;
        newTeam.co_captains = [req.user._id];
        newTeam.team_name = req.body.team_name;
        newTeam.country = req.body.country;
        newTeam.province = req.body.province;
        newTeam.city = req.body.city;
        newTeam.classes = classes;
        newTeam.divisions = divisions;
        newTeam.class_divisions= class_divisions;
        newTeam.sponsor = req.body.sponsor;
        newTeam.facebook_page_url = req.body.team_facebook;
        newTeam.twitter_handle = req.body.twitter_handle;
        newTeam.youtube_link = req.body.youtube_link;
        newTeam.phone_number = req.body.team_phone_number;
        newTeam.email = req.body.team_email;
        newTeam.website_url = req.body.team_website;
        newTeam.slug = slug;

        console.log(newTeam);
        newTeam.save(function(err){
            Team.find({}, function(err, tms) {
                teamMembers.team_id = tms._id;
                teamMembers.member_id = req.user._id;
                teamMembers.member_name = req.user.firstname + " " + req.user.lastname;
                teamMembers.request_status = 2;
                teamMembers.email = req.user.local.email;
                teamMembers.date = new Date();
                teamMembers.accepted_date = new Date();
                teamMembers.active = 1;
                teamMembers.save();

                Division.find({}, function(err, docs){
                    res.render('teams.ejs', {
                        user : req.user, // get the user out of session and pass to template
                        teams:tms,
                        divisions: docs
                    });
                });
            });
        });


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

    app.get('/team-view/:slug', function(req,res) {
        Team.find({slug:req.params.slug}, function(err, tm) {
            if(tm){
                console.log(tm[0]);
                Division.find({}, function(err, docs){
                    TeamMembers.find({}, function(err, membs){ 
                        res.render('teamView.ejs', {
                            user : req.user, // get the user out of session and pass to template
                            teamDetails:tm,
                            divisions: docs,
                            teamMembers: membs
                            //captian: captain
                        });
                    });
                });
            }
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

