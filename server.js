// server.js
var config = require('./configuration/conf.json')

var express    = require('express')
var app        = express()
var passport   = require('passport')
var session    = require('express-session')
var bodyParser = require('body-parser')
var env        = require('dotenv').load()
var exphbs     = require('express-handlebars')

var flash      = require('connect-flash')

var cookieParser = require('cookie-parser')
var cookie     = require('cookie');

var port = process.env.PORT || 3000

var morgan = require('morgan')
var SSE = require('sse')
var clients = []

// set up our express application
app.use(morgan('dev')) // log every request to the console



//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// to support JSON-encoded bodies
app.use(cookieParser()) // read cookies (needed for auth)

 // For Passport
app.use(session({
  secret: config.session_secret,
  resave: true,
  saveUninitialized:true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session

 //For Handlebars
app.set('views', './app/views')
// app.engine('hbs', exphbs({extname: '.hbs'}));
// app.set('view engine', '.hbs');
app.set('view engine', 'ejs') // set up ejs for templating

app.get('/', function (req, res) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {

    console.log('req.user.username --> ' + req.user.username);

    var cookie = req.cookies.betify_user_name;
    res.cookie('betify_user_name', req.user.username, { maxAge: 900000, httpOnly: true });

    // load the index.ejs file
    res.render('index.ejs', {
    user: req.user // get the user out of session and pass to template
    })
  } else {
    res.clearCookie('betify_user_name');

    res.render('index.ejs', {
      user: false
    })
  }
});


// app.use(express.static(path.resolve(__dirname, '/public')))
app.use(express.static(__dirname));


//Models
var models = require("./app/models");


//Routes
var authRoute = require('./app/routes/auth.js')(app,passport);
// var betsRoute = require('./app/routes/bets.js')(app,passport);

//load passport strategies
require('./app/config/passport/passport.js')(passport,models.user);

//load binance socket
require('./app/controllers/binanceapicontroller.js')(models,clients);


//Sync Database
models.sequelize.sync().then(function(){
  console.log('Database Connected!')
}).catch(function(err){
  console.log(err, "Something went wrong with the Database Update!")
});



// Start the app
var server = app.listen(port, '0.0.0.0', function () {
  let host = server.address().address
  let port = server.address().port

  console.log('Server started: Betify at http://%s:%s', host, port)

  // initialize the /sse route
  var sse = new SSE(server)

  // When a connection is made
  sse.on('connection', function (stream) {
    console.log('Opened connection ')
    clients.push(stream)

    // Send data back to the client
    var json = JSON.stringify({ message: 'Gotcha' })
    stream.send(json)
    console.log('Sent: ' + json)

    // The connection was closed
    stream.on('close', function () {
      clients.splice(clients.indexOf(stream), 1)
      console.log('Closed connection ')
    })
  })
})

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  let cookief = socket.handshake.headers.cookie;
  let cookies = cookie.parse(socket.handshake.headers.cookie);

  let betify_user_name = 'Guest User';

  if(cookies.betify_user_name){
    betify_user_name = cookies.betify_user_name;
  }

  socket.on('main chatroom', function(msg){
    io.emit('main chatroom', {
      user_name: betify_user_name,
      msg: msg
    });
  });
});


