var exports = module.exports = {}

var models = require("../models");

exports.placebet = function(req,res){

  var Bets = models.bets;
  var User = models.user;

  // {"game_id":99999,"game_type":"BTCUSDT","bet_type":"up","bet_value":150}

  if(req.user && req.user.balance >= req.body.bet_value){
      User.findById(req.user.id).then(user => {
        return user.decrement('balance', {by: req.body.bet_value})
      }).then(updated_user => {

        console.log(updated_user);
        // Postgres will return the updated user by default (unless disabled by setting { returning: false })
        // In other dialects, you'll want to call user.reload() to get the updated instance...
        Bets.create({
          user_id: updated_user.id,
          game_id: req.body.game_id,
          game_type: req.body.game_type,
          bet_type: req.body.bet_type,
          bet_value: req.body.bet_value,
        }).then(bets => {
          let response = bets.get();
          response.balance = updated_user.balance;

          User.findById(req.user.id)

          res.setHeader('Content-Type', 'application/json');
          res.send(response);
        })

      })
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.send({msg: "You are not logged in or does not have enought balance."});
  }

  // User.findOne({where: {email:email}}).then(function(bet){

  //   if (user) {
  //     return done(null, false, req.flash('signupMessage', 'That Email is already taken.'));
  //   }
  //   else {
  //     var userPassword = generateHash(password);
  //     var data = {
  //       email     : email,
  //       password  : userPassword,
  //       username  : req.body.username,
  //       firstname : req.body.firstname,
  //       lastname  : req.body.lastname
  //     };

  //     User.create(data).then(function(newUser,created){
  //       if(!newUser){
  //         return done(null,false);
  //       }

  //       if(newUser){
  //         return done(null,newUser);
  //       }

  //     });
  //   }
  // });

}