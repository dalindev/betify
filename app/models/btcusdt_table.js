module.exports = function(sequelize, Sequelize) {

  var Btcusdt = sequelize.define('btcusdt_table', {
    id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
    exchange_name: { type: Sequelize.STRING,notEmpty: true},
    symbol: { type: Sequelize.STRING,notEmpty: true},
    game_id : { type:Sequelize.INTEGER},
    next_game_id : { type:Sequelize.INTEGER},
    start_price: { type: Sequelize.FLOAT(18, 8),notEmpty: true},
    close_price: { type: Sequelize.FLOAT(18, 8),notEmpty: true},
    price_diff: { type: Sequelize.FLOAT(18, 8),notEmpty: true},
    close_time: { type:Sequelize.DATE}
  });

  return Btcusdt;
}