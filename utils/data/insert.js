'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../../logger');
const Models = require('../../models/models');


function insertIteration(Model) {
	return new Promise((resolve, reject) => {

		if (!fs.existsSync(__dirname + path.sep + Model.name) || !fs.existsSync(__dirname + path.sep + Model.name + path.sep + 'model.json')) {
			resolve([]);
			return;
		}

		let obj = JSON.parse(fs.readFileSync(__dirname + path.sep + Model.name + path.sep + 'model.json', 'utf8'));

		// Model.destroy({ force: true, where: { id: {$gt: 0} }}).then(() => {

			Model.bulkCreate(obj)
				.then(o => {
					logger.info('created ' + o.length);
					resolve(o);
				})
				.catch(err => {
					logger.error(err);
					reject(err);
				});

		// });
	});
}

let i = -1;

function insert() {
	return new Promise((resolve, reject) => {
		if (++i >= Models.Models.length) {
			resolve();
		}
		insertIteration(Models.Models[i]).then(() => {
			insert().then(resolve).catch(reject);
		}).catch(reject);
	});
}

/**
 * Read models and try to find json data file.
 * @type {Promise}
 */
module.exports = insert();
