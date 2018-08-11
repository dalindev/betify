module.exports = function(sequelize, Sequelize) {

  var User = sequelize.define('user', {
    id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
    firstname: { type: Sequelize.STRING,notEmpty: true},
    lastname: { type: Sequelize.STRING,notEmpty: true},
    username: { type: Sequelize.STRING,notEmpty: true},
    about: { type:Sequelize.TEXT},
    email: { type:Sequelize.STRING, validate: {isEmail:true} },
    password: { type: Sequelize.STRING,allowNull: false },
    deposit: { type: Sequelize.FLOAT,allowNull: false, defaultValue: 0 },
    balance: { type: Sequelize.FLOAT,allowNull: false, defaultValue: 0 },
    last_login: {type: Sequelize.DATE},
    status: {type: Sequelize.ENUM('active','inactive'),defaultValue:'active' }
  });

  return User;
}