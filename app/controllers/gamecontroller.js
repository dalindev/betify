var exports = module.exports = {}

var models = require("../models");

exports.placebet = function(req,res){

  var Bets = models.bets;
  var User = models.user;

  // {"game_id":99999,"game_type":"BTCUSDT","bet_type":"up","bet_value":150}

  res.setHeader('Content-Type', 'application/json');

  if(req.user && req.body.game_id && req.user.balance >= req.body.bet_value){
      User.findById(req.user.id).then(updated_user => {

        console.log(updated_user);
        // Postgres will return the updated user by default (unless disabled by setting { returning: false })
        // In other dialects, you'll want to call user.reload() to get the updated instance...

        Bets.findOrCreate({
          where: {
            user_id: updated_user.id,
            game_id: req.body.game_id,
          },
          defaults: { // set the default properties if it doesn't exist
            user_id: updated_user.id,
            game_id: req.body.game_id,
            game_type: req.body.game_type,
            bet_type: req.body.bet_type,
            bet_value: req.body.bet_value,
            active: true
          }
        }).then(result => {
          var bets = result[0]; // the instance of the author
          var created = result[1]; // boolean stating if it was created or not

          if(created){
            let response = bets.get();
            response.balance = updated_user.balance;

            User.findById(req.user.id).then(user => {
              return user.decrement('balance', {by: req.body.bet_value})
            }).then(user => {
              response.balance -= req.body.bet_value;
              res.send(response);
            }).catch(function (err) {
              res.send({msg: "Something is wrong..."});
            });

          } else {
            res.send({msg: "Bets exist"});
          }
        })

      })
  } else {
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