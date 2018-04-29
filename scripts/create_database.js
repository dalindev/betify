/**
 *
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

// connection.query("CREATE DATABASE IF NOT EXISTS " + dbconfig.database, function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//     crateTable();
//   });
// console.log('Success: Database Created!');

connection.query('\
CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(60) NOT NULL, \
    `email` VARCHAR(150) DEFAULT NULL, \
    `firstname` VARCHAR(80) DEFAULT NULL, \
    `lastname` VARCHAR(80) DEFAULT NULL, \
    `city` VARCHAR(80) DEFAULT NULL, \
    `prov` VARCHAR(80) DEFAULT NULL, \
    `postal_code` VARCHAR(80) DEFAULT NULL, \
    `country` VARCHAR(80) DEFAULT NULL, \
    `phone` VARCHAR(16) DEFAULT NULL, \
    `phone_other` VARCHAR(16) DEFAULT NULL, \
    `birth_day` DATE DEFAULT NULL, \
    `password` CHAR(64) NOT NULL, \
    `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \
    `removed` TIMESTAMP NULL, \
    `suspended` TIMESTAMP NULL, \
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)', function (err, result) {
    if (err) throw err;
    console.log(dbconfig.users_table + " created");
});


/**
 *
 */
connection.query('\
CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.addresses_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `uuid` VARCHAR(36) NOT NULL DEFAULT 0, \
    `user_id` INT NOT NULL, \
    `primary_address` BOOLEAN NOT NULL DEFAULT 0, \
    `address_name` VARCHAR(60) NOT NULL, \
    `country` VARCHAR(80) DEFAULT NULL, \
    `address` VARCHAR(255) DEFAULT NULL, \
    `address2` VARCHAR(255) DEFAULT NULL, \
    `city` VARCHAR(80) DEFAULT NULL, \
    `prov` VARCHAR(80) DEFAULT NULL, \
    `postal_code` VARCHAR(80) DEFAULT NULL, \
    `phone` VARCHAR(16) DEFAULT NULL, \
    `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \
    `deleted` TIMESTAMP NULL DEFAULT NULL, \
    `suspended` TIMESTAMP NULL DEFAULT NULL, \
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)', function (err, result) {
    if (err) throw err;
    console.log(dbconfig.addresses_table + " created");
});


/**
 *
 */
connection.query('\
CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`. btcusdt_table ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `exchange_name` VARCHAR(32),\
    `symbol` VARCHAR(32) NOT NULL, \
    `close_price` VARCHAR(32) NOT NULL, \
    `close_time` VARCHAR(32) NOT NULL, \
    `close_qty` VARCHAR(32) NOT NULL,\
    `game_time_counter` INT NOT NULL DEFAULT 0,\
    `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \
    `deleted` TIMESTAMP NULL DEFAULT NULL, \
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)', function (err, result) {
    if (err) throw err;
    console.log("btcusdt_table created");
});


connection.end();

