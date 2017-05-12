'use strict';

const db = require('../db');

const modelName = 'User';

let Model = db.sequelize.define(modelName, {

	id: {
		type: db.Sequelize.BIGINT(),
		primaryKey: true,
	},

	first_name: {
		type: db.Sequelize.STRING,
		allowNull: true,
	},

	last_name: {
		type: db.Sequelize.STRING,
		allowNull: true,
	},

	profile_pic: {
		type: db.Sequelize.STRING,
		allowNull: true,
	},

	locale: {
		type: db.Sequelize.STRING,
		allowNull: true,
	},

	timezone: {
		type: db.Sequelize.STRING,
		allowNull: true,
	},

	gender: {
		type: db.Sequelize.STRING,
		allowNull: true,
	},

	// real photo
	user_photo: {
		type: db.Sequelize.BLOB,
		allowNull: true,
	},

	phone: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: '',
	},

	seat_address: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: '',
	},

	stadium: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: '',
	},

	game: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: '',
	},

}, {
	tableName: 'users',

	instanceMethods: {

	},

	classMethods: {

	},
timestamps  : true,
underscored : true
});

module.exports = Model;
