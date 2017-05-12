'use strict';

const db = require('../db');

let Model = db.sequelize.define('Order', {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	game: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: '',
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

	status: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: 'PENDING',
	},

	stadium: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: '',
	},

	bot_channel: {
		type: db.Sequelize.STRING,
		allowNull: true,
		defaultValue: '',
	},

	total: {
		type: db.Sequelize.DECIMAL(10, 2),
		allowNull: true,
		defaultValue: 0.0,
	},

}, {
	tableName: 'orders',
	indexes: [
		{
			name: 'index_orders_on_game',
			unique: false,
			method: 'BTREE',
			fields: ['game'],
		},
		{
			name: 'index_orders_on_seat_address',
			unique: false,
			method: 'BTREE',
			fields: ['seat_address'],
		},
		{
			name: 'index_orders_on_stadium',
			unique: false,
			method: 'BTREE',
			fields: ['stadium'],
		},
	],
	instanceMethods: {

		getAmount() {
			return new Promise((resolve, reject) => {
				this.getOrderItems().then(items => {
					resolve(items.reduce((result, item) => {
						return result + item.getAmount();
					}, 0))
				}).catch(reject)
			})
		},

	},

	// classMethods: {

	// 	PENDING: 'PENDING',
	// 	DELIVERED: 'DELIVERED',
	// 	CANCELED:'CANCELED',

	// },
timestamps  : true,
underscored : true
});

module.exports = Model;
