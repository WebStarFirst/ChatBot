'use strict';

const Botkit = require('botkit').core;
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

function Facebookbot(configuration) {

	// Create a core botkit bot
	let facebookBotkit = Botkit(configuration || {});

	// customize the bot definition, which will be used when new connections
	// spawn!
	facebookBotkit.defineBot(function (botkit, config) {

		var bot = {
			botkit: botkit,
			config: config || {},
			utterances: botkit.utterances,
		};

		bot.startConversation = function(message, cb) {
			botkit.startConversation(this, message, cb);
		};

		bot.send = function(message, cb) {

			let facebookMessage = {
				recipient: {},
				message: {},
			};

			if (typeof(message.channel) === 'string'
				&& message.channel.match(/\+\d+\(\d\d\d\)\d\d\d\-\d\d\d\d/)) {
				facebookMessage.recipient.phone_number = message.channel;
			} else {
				facebookMessage.recipient.id = message.channel;
			}

			if (message.text) {
				facebookMessage.message.text = message.text;
			}

			if (message.attachment) {
				facebookMessage.message.attachment = message.attachment;
			}

			if (message.quick_replies) {
				facebookMessage.message.quick_replies = message.quick_replies;
			}

			request.post(`https://graph.facebook.com/me/messages?access_token=${configuration.access_token}`,
				(err, res, body) => {
					if (err) {
						botkit.debug('WEBHOOK ERROR', err);
						return cb && cb(err);
					}

					let json = null;

					try {
						json = JSON.parse(body);
					} catch (err) {
						botkit.debug('JSON Parse error: ', err);
						return cb && cb(err);
					}

					if (json.error) {
						botkit.debug('API ERROR', json.error);
						return cb && cb(json.error.message);
					}

					botkit.debug('WEBHOOK SUCCESS', body);
					if (cb) {
						cb(null, body);
					}

					return null;
				}).form(facebookMessage);
		};

		bot.getUser = function (userId) {
			return new Promise((resolve, reject) => {
				request.get(`https://graph.facebook.com/v2.6/${userId}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${configuration.access_token}`,
					(err, res, body) => {
						if (err) {
							botkit.debug('GET_USER ERROR', err);
							reject(err);
						}

						let json = null;

						try {
							json = JSON.parse(body);
						} catch (err) {
							botkit.debug('JSON Parse error: ', err);
							reject(err);
						}

						if (json.error) {
							botkit.debug('API ERROR', json.error);
							reject(json.error.message);
						}

						botkit.debug('GET_USER SUCCESS', body);
						resolve(JSON.parse(body));

						return;

					});
			})
		}

		bot.reply = function(src, resp, cb) {
			let msg = {};

			if (typeof(resp) === 'string') {
				msg.text = resp;
			} else {
				msg = resp;
			}

			msg.channel = src.channel;

			bot.say(msg, cb);
		};

		bot.findConversation = function(message, cb) {
			console.log(message);
			botkit.debug('CUSTOM FIND CONVO', message.user, message.channel);
			for (let t = 0; t < botkit.tasks.length; t++) {
				for (let c = 0; c < botkit.tasks[t].convos.length; c++) {
					if (
						botkit.tasks[t].convos[c].isActive() &&
						botkit.tasks[t].convos[c].source_message.user === message.user
					) {
						botkit.debug('FOUND EXISTING CONVO!');
						cb(botkit.tasks[t].convos[c]);
						return;
					}
				}
			}

			cb();
		};

		return bot;

	});


	// set up a web route for receiving outgoing webhooks and/or slash commands

	facebookBotkit.createWebhookEndpoints = function(webserver, bot, cb) {

		facebookBotkit.log(
			`** Serving webhook endpoints for Messenger Platform at: 
			http://MY_HOST:${facebookBotkit.config.port}/facebook/receive`);
		webserver.post('/facebook/receive', (req, res) => {

			facebookBotkit.debug('GOT A MESSAGE HOOK');
			let obj = req.body;
			if (obj.entry) {
				for (let e = 0; e < obj.entry.length; e++) {
					for (let m = 0; m < obj.entry[e].messaging.length; m++) {
						let facebookMessage = obj.entry[e].messaging[m];
						let message = {};
						if (facebookMessage.message) {

							message = {
								text: facebookMessage.message.text,
								user: facebookMessage.sender.id,
								channel: facebookMessage.sender.id,
								timestamp: facebookMessage.timestamp,
								seq: facebookMessage.message.seq,
								mid: facebookMessage.message.mid,
								attachments: facebookMessage.message.attachments,
							};

							facebookBotkit.receiveMessage(bot, message);
						} else if (facebookMessage.postback) {

							// trigger BOTH a facebook_postback event
							// and a normal message received event.
							// this allows developers to receive postbacks as part of a conversation.
							message = {
								payload: facebookMessage.postback.payload,
								user: facebookMessage.sender.id,
								channel: facebookMessage.sender.id,
								timestamp: facebookMessage.timestamp,
							};

							facebookBotkit.trigger('facebook_postback', [bot, message]);

							message = {
								text: facebookMessage.postback.payload,
								user: facebookMessage.sender.id,
								channel: facebookMessage.sender.id,
								timestamp: facebookMessage.timestamp,
							};

							facebookBotkit.receiveMessage(bot, message);

						} else if (facebookMessage.optin) {

							message = {
								optin: facebookMessage.optin,
								user: facebookMessage.sender.id,
								channel: facebookMessage.sender.id,
								timestamp: facebookMessage.timestamp,
							};

							facebookBotkit.trigger('facebook_optin', [bot, message]);
						} else if (facebookMessage.delivery) {

							message = {
								optin: facebookMessage.delivery,
								user: facebookMessage.sender.id,
								channel: facebookMessage.sender.id,
								timestamp: facebookMessage.timestamp,
							};

							facebookBotkit.trigger('message_delivered', [bot, message]);

						} else {
							facebookBotkit.log('Got an unexpected message from Facebook: ', facebookMessage);
						}
					}
				}
			}
			res.send('ok');
		});

		webserver.get('/facebook/receive', (req, res) => {
			if (req.query['hub.mode'] === 'subscribe') {
				if (req.query['hub.verify_token'] === configuration.verify_token) {
					res.send(req.query['hub.challenge']);
				} else {
					res.send('OK');
				}
			}
		});

		if (cb) {
			cb();
		}

		return facebookBotkit;
	};

	facebookBotkit.setupWebserver = function(port, cb) {

		if (!port) {
			throw new Error('Cannot start webserver without a port');
		}
		if (isNaN(port)) {
			throw new Error('Specified port is not a valid number');
		}

		let staticDir = `${__dirname}/public`;

		if (facebookBotkit.config && facebookBotkit.config.webserver
			&& facebookBotkit.config.webserver.static_dir) {
			staticDir = facebookBotkit.config.webserver.static_dir;
		}

		facebookBotkit.config.port = port;

		facebookBotkit.webserver = express();
		facebookBotkit.webserver.use(bodyParser.json());
		facebookBotkit.webserver.use(bodyParser.urlencoded({ extended: true }));
		facebookBotkit.webserver.use(express.static(staticDir));

		facebookBotkit.webserver.listen(
			facebookBotkit.config.port,
			() => {
				facebookBotkit.log(`** Starting webserver on port ${facebookBotkit.config.port}`);
				if (cb) { cb(null, facebookBotkit.webserver); }
			}
		);


		request.post(`https://graph.facebook.com/me/subscribed_apps?access_token=${configuration.access_token}`,
			(err, res, body) => {
				if (err) {
					facebookBotkit.log('Could not subscribe to page messages');
				} else {
					facebookBotkit.debug('Successfully subscribed to Facebook events:', body);
					facebookBotkit.startTicking();
				}
			});

		return facebookBotkit;

	};

	return facebookBotkit;
}

module.exports = Facebookbot;
