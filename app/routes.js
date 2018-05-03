// Database
var mysql = require('mysql')
var dbconfig = require('../config/database')
var connection = mysql.createConnection(dbconfig.connection)
const uuidv4 = require('uuid/v4')

// var config = require('../configuration/conf.json')
// REST API
// var Client = require('node-rest-client').Client
// configure basic http auth for every request
// var options_auth = { user: config.canadapost_username, password: config.canadapost_password };
// var client = new Client(options_auth);
// client.serializers.find("XML").options={"renderOpts":{"pretty": true }};

// app/routes.js
module.exports = function (app, passport) {
  //  ======================================================================
  // API ===================================================================

  /* ------------------------------------------------------- */
  app.get('/alladdresses', isLoggedIn, function (req, res) {
    console.log(req)
    connection.query('SELECT * FROM addresses', function (error, results, fields) {
      if (error) throw error
      res.end(JSON.stringify(results))
    })
  })

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', function (req, res) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
      // load the index.ejs file
      res.render('index.ejs', {
        user: req.user // get the user out of session and pass to template
      })
    } else {
      res.render('index.ejs', {
        user: false
      })
    }
  })

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function (req, res) {
    // if user already logged in, redirect to profile
    if (req.isAuthenticated()) {
      res.redirect('/profile')
    }
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') })
  })

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),
  function (req, res) {
    if (req.body.remember) {
      req.session.cookie.maxAge = 1000 * 60 * 3
    } else {
      req.session.cookie.expires = false
    }
    res.redirect('/')
  })

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function (req, res) {
    // if user already logged in, redirect to profile
    if (req.isAuthenticated()) {
      res.redirect('/profile')
    }
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') })
  })

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  // =====================================
  // PROFILE SECTION
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function (req, res) {
    // load addresses for this user
    connection.query('SELECT * FROM addresses WHERE user_id = ?', [req.user.id], function (err, addrRows) {
      if (err) {
        console.log('ERROR-log: fail to select addresses from DB')
        return err
      }

      res.render('profile.ejs', {
        user: req.user, // get the user out of session and pass to template
        addresses: addrRows
      })
    })
  })

  // =====================================
  // PROFILE EDIT PAGE
  // =====================================
  app.get('/profile/edit', isLoggedIn, function (req, res) {
    res.render('profile-edit.ejs', {
      user: req.user // get the user out of session and pass to template
    })
  })
  // PROFILE EDIT CALL
  app.post('/profile/edit/:id', isLoggedIn, function (req, res, next) {
    connection.query('SELECT * FROM users WHERE username = ?', [req.user.username], function (err, rows) {
      if (err) { return next(err) }
      if (rows.length) {
        var editUserMysql = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          city: req.body.city,
          prov: req.body.prov,
          country: req.body.country,
          postal_code: req.body.postal_code,
          username: req.user.username
        }

        var insertQuery = 'UPDATE users SET firstname = ?, lastname = ?, email = ?, phone = ?, city = ?, prov = ?, country = ?, postal_code = ? WHERE username = ?'

        connection.query(insertQuery, [ editUserMysql.firstname,
          editUserMysql.lastname,
          editUserMysql.email,
          editUserMysql.phone,
          editUserMysql.city,
          editUserMysql.prov,
          editUserMysql.country,
          editUserMysql.postal_code,
          editUserMysql.username
        ], function (err, rows) {
          if (err) { return next(err) }
          editUserMysql.id = req.user.id
          return next(null, editUserMysql)
        })
      } else {
        // can't find this user
        return next(null, false, req.flash('profileEditMessage', 'Error: Can not find this user'))
      }
    })
  },
  function (req, res) {
    // call back
    console.log('user updated')
    res.redirect('/profile')
  })

  // =====================================
  // ADD NEW ADDRESS PAGE
  // =====================================
  app.get('/profile/address/add', isLoggedIn, function (req, res) {
    res.render('profile-address-add.ejs', {
      user: req.user // get the user out of session and pass to template
    })
  })

  // ADD NEW ADDRESS CALL
  app.post('/profile/address/add/:id', isLoggedIn, function (req, res, next) {
    console.log('req id' + JSON.stringify(req.body))
    // make sure this user is valid
    connection.query('SELECT * FROM users WHERE username = ?', [req.user.username], function (err, rows) {
      if (err) { return next(err) }
      if (rows.length) {
        var addressAddMysql = {
          uuid: uuidv4(), // -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
          user_id: req.user.id,
          primary_address: req.body.primary_address,
          address_name: req.body.address_name,
          country: req.body.country,
          address: req.body.address,
          address2: req.body.address2,
          city: req.body.city,
          prov: req.body.prov,
          postal_code: req.body.postal_code,
          phone: req.body.phone
        }

        var insertQuery = 'INSERT INTO addresses ( uuid, user_id, primary_address, address_name, country, address, address2, city, prov, postal_code, phone ) values (?,?,?,?,?,?,?,?,?,?,?)'

        connection.query(insertQuery, [
          addressAddMysql.uuid,
          addressAddMysql.user_id,
          addressAddMysql.primary_address,
          addressAddMysql.address_name,
          addressAddMysql.country,
          addressAddMysql.address,
          addressAddMysql.address2,
          addressAddMysql.city,
          addressAddMysql.prov,
          addressAddMysql.postal_code,
          addressAddMysql.phone
        ], function (err, rows) {
          if (err) console.log('error --------->' + err)
          return next(null, addressAddMysql)
        })
      } else {
        // can't find this user
        return next(null, false, req.flash('profileAddressAddMessage', 'Error: Can not find this user'))
      }
    })
  },
  function (req, res) {
    // call back
    console.log('New address added')
    res.redirect('/profile')
  })

  // =====================================
  // ADDRESS EDIT PAGE
  // =====================================
  app.get('/profile/address/edit/:uuid', isLoggedIn, function (req, res) {
    connection.query('SELECT * FROM addresses WHERE user_id = ? AND uuid = ? LIMIT 1', [req.user.id, req.params.uuid], function (err, address) {
      if (err) {
        console.log('err--------->' + err)
        return (err)
      }
      if (address.length) {
        res.render('profile-address-edit.ejs', {
          user: req.user,
          address: address[0] // get the user out of session and pass to template
        })
      } else {
        // can't find this user
        // return next(null, false, req.flash('profileAddressEditMessage', 'Error: Can not find this user or address does not exist'));
        res.redirect('/profile')
      }
    })
  })

  // PROFILE ADDRESS EDIT CALL
  app.post('/profile/address/update/:uuid', isLoggedIn, function (req, res, next) {
    connection.query('SELECT * FROM addresses WHERE user_id = ? AND uuid = ? LIMIT 1', [req.user.id, req.params.uuid], function (err, address) {
      if (err) {
        console.log('err--------->' + err)
        return next(err)
      }

      if (address.length) {
        var addressEditMysql = {
          primary_address: req.body.primary_address,
          address_name: req.body.address_name,
          country: req.body.country,
          address: req.body.address,
          address2: req.body.address2,
          city: req.body.city,
          prov: req.body.prov,
          postal_code: req.body.postal_code,
          phone: req.body.phone,
          address_id: address[0].id
        }

        if (addressEditMysql.primary_address === 1 || addressEditMysql.primary_address === '1') {
          connection.query('UPDATE addresses SET primary_address = 0 WHERE user_id = ? LIMIT 500', [req.user.id], function (err, address) {
            if (err) { return next(err) }
          })
        }

        var insertQuery = `UPDATE addresses SET primary_address = ?,
                          address_name = ?,
                          country = ?,
                          address = ?,
                          address2 = ?,
                          city = ?,
                          prov = ?,
                          postal_code = ?,
                          phone = ?
                        WHERE id = ? LIMIT 1`

        connection.query(insertQuery, [
          addressEditMysql.primary_address,
          addressEditMysql.address_name,
          addressEditMysql.country,
          addressEditMysql.address,
          addressEditMysql.address2,
          addressEditMysql.city,
          addressEditMysql.prov,
          addressEditMysql.postal_code,
          addressEditMysql.phone,
          addressEditMysql.address_id
        ],
        function (err, rows) {
          if (err) { return next(err) }
          return next(null, addressEditMysql)
        })
      } else {
        // can't find this user
        return next(null, false, req.flash('profileAddressEditMessage', 'Error: Can not find this user or address does not exist'))
      }
    })
  },
  function (req, res) {
    // call back
    console.log('Address updated')
    res.redirect('/profile')
  })

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
  })

  // Handle 404 - Keep this as a last route
  // app.use(function(req, res, next) {
  //  res.status(400);
  //  res.send('404: File Not Found');
  // });

  // END API =====================================
}

// route middleware to make sure
function isLoggedIn (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) { return next() }

  // if they aren't redirect them to the home page
  res.redirect('/')
}
