module.exports = function(sequelize, Sequelize) {

  var Bets = sequelize.define('bets', {
    id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
    user_id: { type: Sequelize.INTEGER,notEmpty: true},
    game_id: { type: Sequelize.INTEGER,notEmpty: true},
    game_type: { type: Sequelize.INTEGER,notEmpty: true, defaultValue:0},
    bet_type: {type: Sequelize.INTEGER,allowNull: false },
    bet_value: {type: Sequelize.INTEGER,allowNull: false }
  });

  return Bets;
}