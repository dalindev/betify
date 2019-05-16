var exports = module.exports = {}


exports.signup = function(req,res){

  res.render('signup', { message: req.flash('signupMessage')});

}

exports.login = function(req,res){

  res.render('login', { message: req.flash('loginMessage')});

}

exports.profile = function(req,res){

  res.render('profile', {
    user: req.user, // get the user out of session and pass to template
    addresses: ''
  });

}

exports.logout = function(req,res){

  req.session.destroy(function(err) {
    res.redirect('/');
  });

}
