'use strict';

// const Botkit = require('botkit');
const Facebookbot = require('./botapi/Facebook');
const config = require('./config');
const logger = require('./logger');
const Conversation = require('./conversation');
const db = require('./db');
const BotStorage = require('./botapi/postgres_storage');
const PersistentMenu = require('./botapi/persistent_menu');
const PersistentMenuStructured = require('./botapi/structure_content/persistent_menu');

BotStorage({
	sequelize: db.sequelize,
	Sequelize: db.Sequelize,
}).then(botStorage => {


	const controller = Facebookbot({
		storage: botStorage,
		debug: config.bot.debug,
		logLevel: 10,
		access_token: process.env.page_token || config.bot.page_token,
		verify_token: process.env.verify_token || config.bot.verify_token,
	});


	const bot = controller.spawn({});
	let menu = null;

	let persistentMenu = new PersistentMenu(controller);
	persistentMenu
		.addAction({
			title: "google 1",
			type: PersistentMenuStructured.WEBURL,
			action: "http://google.com",
		})
		.addAction({
			title: "Menu",
			type: PersistentMenuStructured.POSTBACK,
			action: "MAINMENU",
		}, (bot, message) => {
			if (!menu || !menu.convo.isActive()) {
				console.log('persistentMenu create menu');
				menu = new Conversation(bot, message, controller);
			} else {
				console.log('persistentMenu  showMainMenu');
				menu.showMainMenu();
			}
		});
	persistentMenu.create();

	// get port from heroku
	controller.setupWebserver(process.env.PORT || config.bot.port || 3000, (err, webserver) => {
		controller.createWebhookEndpoints(webserver, bot, () => {
			logger.info('ONLINE!');
		});
	});

	controller.on('message_received', (bot, message) => {
		if (!menu || !menu.convo.isActive()) {
			console.log('CREATE NEW CONVO!!!!!', message);
			// console.log('GET IMAGE', message.attachments, message.attachments.payload);
			menu = new Conversation(bot, message, controller);
		}
	});

	controller.on('tick', () => {
		//empty
	});

	controller.on('message_delivered', () => {
		//empty
	});

}).catch(e => logger.error(e));
