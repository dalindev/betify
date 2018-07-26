var authController = require('../controllers/authcontroller.js');

module.exports = function(app,passport){

  app.get('/signup', authController.signup);
  app.get('/login', authController.login);


  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
  }));

  app.get('/profile',isLoggedIn, authController.profile);

  app.get('/logout',authController.logout);

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true // allow flash messages
  }),
  function (req, res) {
    if (req.body.remember) {
      req.session.cookie.maxAge = 1000 * 60 * 3
    } else {
      req.session.cookie.expires = false
    }
    res.redirect('/')
  });


  // put game bet
  app.post('/games/placebet',isLoggedIn, authController.placebet);


  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();

    res.redirect('/login');
  }


}
