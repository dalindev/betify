var exports = module.exports = {}

var models = require("../models");

exports.placebet = function(req,res){

  // console.log('JSON -----------' + JSON.stringify(req) );
  let tets = JSON.stringify(req.body);
  console.log('what------'+tets);
  console.log('what------'+req.body.game_id);

  // {"game_id":99999,"game_type":"BTCUSDT","bet_type":"up","bet_value":150}

  models.bets.create({
    user_id: 7788,
    game_id: req.body.game_id,
    game_type: req.body.game_type,
    bet_type: req.body.bet_type,
    bet_value: req.body.bet_value,

  }, {}).then(bets => {
    // let's assume the default of isAdmin is false:
    console.log(bets.get({
      plain: true
    })) // => { username: 'barfooz', isAdmin: false }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ saved: 'saved to DB' }));

  })

}

