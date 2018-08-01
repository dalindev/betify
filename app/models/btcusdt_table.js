module.exports = function(sequelize, Sequelize) {

  var Btcusdt = sequelize.define('btcusdt_table', {
    id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
    exchange_name: { type: Sequelize.STRING,notEmpty: true},
    symbol: { type: Sequelize.STRING,notEmpty: true},
    game_id : { type:Sequelize.INTEGER},
    start_price: { type: Sequelize.FLOAT,notEmpty: true},
    close_price: { type: Sequelize.FLOAT,notEmpty: true},
    price_diff: { type: Sequelize.FLOAT,notEmpty: true},
    close_time: { type:Sequelize.DATE}
  });

  return Btcusdt;
}