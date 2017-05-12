'use strict';

const Sequelize = require('sequelize');
const config = require('./config');
const logger = require('./logger');

console.log('database DATABASE_URL:', process.env.DATABASE_URL);
console.log('database localurl:', config.database.url);
//ORM connection settings
const sequelize = new Sequelize(process.env.DATABASE_URL || config.database.url, {
	//logging: true,
	define: {
		charset: 'utf8',
		collate: 'utf8_general_ci',
	},
	dialect:  'postgres',
	dialectOptions: {
    supportBigNumbers: true,
    bigNumberStrings: true
  }
});

// var match = config.database.url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
// const sequelize = new Sequelize(match[5], match[1], match[2], {
//     dialect:  'postgres',
//     protocol: 'postgres',
//     port:     match[4],
//     host:     match[3],
//     logging: false,
//     dialectOptions: {
//         ssl: true
//     }
// });

/**
 * Connects to PostgreSQL showing an error if failing.
 */

exports.init = (cb) => {

	sequelize
		.authenticate()
		.then(() => {
			// logger.log("*", "PostgreSQL: db initialized.");
			// cb();
			sequelize.sync().then(() => {
				//force: true;
				logger.info('*', 'PostgreSQL: db sync.');
				cb();
			}).catch((error) => {
				logger.error('*', 'PostgreSQL: unable to connect to the database: ' + error.message);
				cb(error);
			});
		});

};

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
