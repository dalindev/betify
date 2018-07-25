// server.js
var config = require('./configuration/conf.json')

// set up ======================================================================
// get all the tools we need
var express = require('express')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var cookie = require('cookie');
var bodyParser = require('body-parser')
var morgan = require('morgan')
var app = express()
var path = require('path')
var port = process.env.PORT || 3000

var passport = require('passport')
var flash = require('connect-flash')
// moment js
var moment = require('moment')

var SSE = require('sse')
var clients = []

// Database
var mysql = require('mysql')
var dbconfig = require('./config/database')
var connection = mysql.createConnection(dbconfig.connection)

connection.connect(function (err) {
  if (err) throw err
  console.log('Looks Good! You are now connected...')
})


/* -------------------------------------------
Public file
------------------------------------------- */
// app.use(express.static(path.resolve(__dirname, '/public')))
app.use(express.static(__dirname));

// configuration ===============================================================
// connect to our database
require('./config/passport')(passport) // pass passport for configuration

// set up our express application
app.use(morgan('dev')) // log every request to the console

// to support JSON-encoded bodies
app.use(cookieParser()) // read cookies (needed for auth)

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.set('view engine', 'ejs') // set up ejs for templating

// required for passport
app.use(session({
  secret: config.session_secret,
  resave: true,
  saveUninitialized: true
})) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session

/* -------------------------------------------
  API
------------------------------------------- */
require('./app/routes.js')(app, passport) // load our routes and pass in our app and fully configured passport


// launch ======================================================================
// app.listen(port);
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


// ===============================================================================
// Binance API / webSocket


const binance = require('node-binance-api')
binance.options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: false // If you want to use sandbox mode where orders are simulated
})

// --------- BTCUSDT ---------
var gameTimeCounter = new Date().getTime();
var gameStartBtcPrice = 0
var gameEndBtcPrice = 0

// For a specific symbol:
binance.websockets.prevDay('BTCUSDT', (error, response) => {
  // var t = new Date( response.eventTime );
  // var formatted = t.format("dd.mm.yyyy hh:MM:ss");
  if (error) throw error

  // console.log(response);

  // save to database
  if (response.symbol &&
      response.close &&
      response.closeTime &&
      response.closeQty &&
      response.eventTime
  ) {
    let closeTime = moment(response.closeTime).format('HH:mm:ss')
    let closePrice = response.close
    let eventTime = response.eventTime

    // console.log(gameTimeCounter);
    // console.log(eventTime);
    // console.log(gameTimeCounter < eventTime);

    // game loop counter
    if (gameTimeCounter <= eventTime) {
      gameStartBtcPrice = closePrice;
      gameEndBtcPrice = closePrice;
      gameTimeCounter = gameTimeCounter + 10*1000;

      let gameId = Math.round(eventTime/1000);

      let btcusdtMysql = {
        exchange_name: 'Binance',
        symbol: response.symbol,
        close_price: response.close,
        close_time: response.closeTime,
        game_time_counter: gameId,
        close_qty: response.closeQty
      }

      let insertQuery = `INSERT INTO
                  btcusdt_table (
                    exchange_name,
                    symbol,
                    close_price,
                    close_time,
                    game_time_counter,
                    close_qty
                  ) values (?,?,?,?,?,?)`
      connection.query(
        insertQuery, [
          btcusdtMysql.exchange_name,
          btcusdtMysql.symbol,
          btcusdtMysql.close_price,
          btcusdtMysql.close_time,
          btcusdtMysql.game_time_counter,
          btcusdtMysql.close_qty
        ], function (err, rows) {
          if (err) {
            console.log('error save btcusdt_table --------->' + err)
          } else {
            // console.log(response);
            connection.query('SELECT id FROM btcusdt_table ORDER BY id DESC LIMIT 1', function (error, results, fields) {
              if (error) throw error
              // res.end(
              JSON.stringify('error ' + results)
              // );
            })
            // console.log(JSON.stringify('res--> ' + results));
            broadcast('BET', closePrice, 0, gameStartBtcPrice, gameEndBtcPrice)
          }
        })
    } else {
      broadcast('', closePrice, 10, gameStartBtcPrice, gameEndBtcPrice)
    }
  }
})

// Every three seconds broadcast "{ message: 'Hello hello!' }" to all connected clients
var broadcast = function (time, close, gameTimeCounter, startBtcPrice, endBtcPrice) {
  var json = JSON.stringify({
    eventTime: time,
    close: close,
    gameTimeCounter: gameTimeCounter,
    startBtcPrice: startBtcPrice,
    endBtcPrice: endBtcPrice
  })

  clients.forEach(function (stream) {
    stream.send(json)
    // console.log('Sent: ' + json);
  })
}


