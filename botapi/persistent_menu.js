'use strict';

const PersistentMenuStructured = require('./structure_content/persistent_menu');
const request = require('request');
const logger = require('../logger');

class PersistentMenu {

	constructor(controller){
		this.strcutured = new PersistentMenuStructured();
		this.controller = controller;
		console.log('persistentMenu created');
	}

	addAction(obj, callback) {
		this.strcutured.addAction(obj);
		if (obj.type == PersistentMenuStructured.POSTBACK) {
			this.controller.hears([obj.action], ['message_received'] , (bot, message) => {
				console.log('message_received', obj, message.text)
				callback(bot, message);
			});
		}
		return this;
	}

	create() {
		return new Promise((resolve, reject) => {
			request.post('https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + this.controller.config.access_token,
				(err, res, body) => {
					if (err) {
						logger.debug('Facebook error: ', err);
						reject(err);
					}

					try {
						var json = JSON.parse(body);
					} catch (err) {
						logger.debug('JSON Parse error: ', err);
						reject(err);

					}

					if (json.error) {
						logger.debug('API ERROR', json.error);
						reject(err);
					}

					logger.debug('WEBHOOK SUCCESS', body);
					resolve(body);
				}).form(this.strcutured.getJSON());
		})
	}

}

module.exports = PersistentMenu;