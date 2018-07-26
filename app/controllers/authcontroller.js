var exports = module.exports = {}


exports.signup = function(req,res){

	res.render('signup', { message: req.flash('signupMessage')});

}

exports.signin = function(req,res){

	res.render('signin');

}

exports.dashboard = function(req,res){

	res.render('dashboard');

}

exports.logout = function(req,res){

  req.session.destroy(function(err) {
  	res.redirect('/');
  });

}
