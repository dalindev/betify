// config/database.js
var config = require('../configuration/conf.json')

module.exports = {
  'connection': {
    'host': config.dbHost,
    'user': config.dbUser,
    'password': config.dbPassword,
    'database': config.dbDatabase
  },
  'database': config.dbDatabase,
  'users_table': 'users',
  'addresses_table': 'addresses'
}
