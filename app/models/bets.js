module.exports = function(sequelize, Sequelize) {

  var Bets = sequelize.define('bets', {
    id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
    user_id: { type: Sequelize.INTEGER,allowNull: false},
    game_id: { type: Sequelize.INTEGER,allowNull: false},
    game_type: { type: Sequelize.STRING,allowNull: false},
    bet_type: { type: Sequelize.STRING,allowNull: false},
    bet_value: { type: Sequelize.INTEGER,allowNull: false},
    active: { type: Sequelize.BOOLEAN,defaultValue: true}
  });

  return Bets;
}