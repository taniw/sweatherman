var express 	   = require('express'),
	ejs			   = require('ejs'),
	path		   = require('path'),
	bodyParser     = require('body-parser'),
	cookieParser   = require('cookie-parser'),
	methodOverride = require('method-override'),
	db             = require('./db.js'),
	session        = require('express-session'), 
	passport       = require('passport'),
	LocalStrategy  = require('passport-local').Strategy,
	request        = require('request'),
	app			   = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

//Passport 
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	db.query('SELECT * FROM users WHERE id = $1', [id], function(err, dbRes) {
		if (!err) {
			done(err, dbRes.rows[0]);
		}
	});
});

var localStrategy = new LocalStrategy(
  function(username, password, done) {
    db.query('SELECT * FROM users WHERE username = $1', [username], function(err, dbRes) {
    	var user = dbRes.rows[0];
    	console.log(username)

    	console.log(user);

    if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
      if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
      return done(null, user);
    })
  });

passport.use(localStrategy);


app.listen(3000, function() {
	console.log("I'm working!");
});

app.get('/', function(req, res) {
	res.render('index.ejs');
});

//Login existing user
app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', passport.authenticate('local',
	{failureRedirect: '/login'}), function(req, res) {
	res.redirect('/');
});



app.get('/profile', function(req, res) {
	console.log(req.user)
	var user = req.user
	res.render('profile', {user: user});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/')
});
























