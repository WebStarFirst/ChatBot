'use strict';

module.exports = function(config) {

	return new Promise((resolve, reject) => {

		const dataStructure =  {

			id: {
				type: config.Sequelize.STRING,
				primaryKey: true,
			},

			data: {
				type: config.Sequelize.JSON,
				allowNull: false,
				defaultValue: 0
			},

		};

		const options = {
			// indexes: [
			// 	{
			// 		unique: false,
			// 		method: 'BTREE',
			// 		fields: ['id'],
			// 	},
			// ]
		}

		let model_teams = config.sequelize.define('_storage_team', dataStructure, options);
		let model_users = config.sequelize.define('_storage_users', dataStructure, options);
		let model_channels = config.sequelize.define('_storage_channels', dataStructure, options);

		var storage = {
			teams: {
				get(team_id, cb) {
					model_teams.findById(team_id)
						.then(item => {
							cb(null, item)
						})
						.catch(err => {
							cb(err, null)
						})
				},
				save(data, cb) {
					model_teams.upsert({
						id: data.id,
						data: data
					})
						.then(item => {
							cb(null)
						})
						.catch(err => {
							cb(err)
						})
				},
				all(cb) {
					model_teams.findAll()
						.then(items => {
							cb(null, items)
						})
						.catch(err => {
							cb(err, null)
						})
				}
			},
			users: {
				get(team_id, cb) {
					model_users.findById(team_id)
						.then(item => {
							cb(null, item)
						})
						.catch(err => {
							cb(err, null)
						})
				},
				save(data, cb) {
					model_users.upsert({
						id: data.id,
						data: data
					})
						.then(item => {
							cb(null)
						})
						.catch(err => {
							cb(err)
						})
				},
				all(cb) {
					model_users.findAll()
						.then(items => {
							cb(null, items)
						})
						.catch(err => {
							cb(err)
						})
				}
			},
			channels: {
				get(team_id, cb) {
					model_channels.findById(team_id)
						.then(item => {
							cb(null, item)
						})
						.catch(err => {
							cb(err, null)
						})
				},
				save(data, cb) {
					model_channels.upsert({
						id: data.id,
						data: data
					})
						.then(item => {
							cb(null)
						})
						.catch(err => {
							cb(err)
						})
				},
				all(cb) {
					model_channels.findAll()
						.then(items => {
							cb(null, items)
						})
						.catch(err => {
							cb(err, null)
						})
				}
			}
		};

		model_teams.sync().then(() => {
			model_users.sync().then(() => {
				model_channels.sync().then(() => {
					resolve(storage)
				}).catch(reject)
			}).catch(reject)
		}).catch(reject)

	});
};