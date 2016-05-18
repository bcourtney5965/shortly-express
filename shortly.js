var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));



var session = require('express-session');
app.use(session({
  secret: 'arbitary top secret data, used for salting',
  resave: false,
  saveUninitialized: true
}));

app.get('/', util.checkUser, function(req, res) {
  res.render('/index');
});

app.get('/create', util.checkUser, function(req, res) {
  res.render('index');
});

app.get('/links', util.checkUser, function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', util.checkUser, function(req, res) {

});































/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login', function(req, res) {
  res.send('login');
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.get('/logout', function(req, res) {



});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

// if username exists
  new User({username: username}).fetch().then(function(user) {
    if (!user) {
      return res.redirect('/login');
    }
    bcrypt.compare(password, user.get('password'), function(err, match) {
      // if match create session and redirect
      if (match) {
        util.createSession(req, res, user);
      } else { // relse redirect login
        res.redirect('/login');
      }
    });
  });
  



});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({username: username})
    .fetch()
    .then(function(user) {
      if (!user) {
        // if userdoens't exist 
        bcrypt.hash(password, null, null, function(err, hash) {
          Users.create({
            username: username,
            password: hash
          }).then(function(user) {
            util.createSession(req, res, user);
          });
        });
      } else {
        console.log('Already taken!');
        res.redirect('/signup');
      }
    });


});







/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
