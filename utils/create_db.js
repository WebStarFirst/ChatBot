'use strict';

let db = require('../db');
let logger = require('../logger');


//db.sequelize.query(`select table_name FROM information_schema.tables WHERE table_schema = 'public' and table_catalog = '${db.sequelize.config.database}';`).spread((results) => {
//	db.sequelize.query(results.reduce((r, item) => r + 'drop table if exists "' + item.table_name + '" cascade; ', '')).spread(() => {
		/* eslint-disable no-unused-vars */
		let tempModels = require('../models/models').Models;
		/* eslint-enable no-unused-vars */
		db.sequelize.sync().then(() => {
			let promise = require('./data/insert');
			promise.then(() => {
				console.log('inserted');
			}).catch(console.log);
		}).catch(console.log);
//	}).catch(console.log);
//}).catch(console.log);
