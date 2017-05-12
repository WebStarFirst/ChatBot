'use strict';

const db = require('../db');

const modelName = 'Conversation';

let Model = db.sequelize.define(modelName, {

	id: {
		type: db.Sequelize.STRING,
		primaryKey: true,
	},

}, {

	instanceMethods: {

	},

	classMethods: {

	},
});

module.exports = Model;
