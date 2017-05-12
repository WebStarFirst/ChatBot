'use strict';

const Button = require('./botapi/structure_content/button');
const Attachment = require('./botapi/structure_content/attachment');
const ButtonsTemplate = require('./botapi/structure_content/buttons_template');
const GenericElement = require('./botapi/structure_content/generic_element');
const GenericTemplate = require('./botapi/structure_content/generic_template');
const QuickReplies = require('./botapi/structure_content/quick_replies');
const logger = require('./logger');
const InventoryItem = require('./models/models').InventoryItem;
const UserModel = require('./models/models').User;
const Order = require('./order');
const ConversationLogger = require('./botapi/Logging');
const MessageUtil = require('./botapi/MessageUtils');

class Menu {

	constructor(bot, message, controller) {
		this.bot = bot;
		this.message = message;
		this.controller = controller;
		this.order = null;
		this.convo = null;
		this.user = null;

		this.start();
	}

	start() {
		this.startConversation().then((user) => {
			this.order = new Order(
				{
					seat_address: '',
					// status: Order.NEW,
					stadium: 'Avaya Stadium',
					phone: `${this.user.get('id')}`,
					game: 'SJ vs NYCFC',
				},
				user
			);
			this.showMainMenu();
		}).catch(e => {
			logger.error(e)
		})
	}

	startConversation() {
		return new Promise((resolve, reject) => {
			this.bot.startConversation(this.message, (err, convo) => {

				if (!err) {
					this.updateContext(convo);
					this.bot.getUser(this.message.user).then((userData) => {
						UserModel.findById(this.message.user).then(userInstance => {
							if (userInstance !== null) {
								logger.debug(`User ${userInstance.get('id')} found`);
								ConversationLogger.saveConv(
									this.convo.provateId,
									this.message.user);
								resolve(userInstance);
								this.user = userInstance;
							} else {
								logger.debug(`User ${this.message.user} not found`);
								UserModel.create(Object.assign(
									{
										id: this.message.user,
									},
									userData
								))
									.then(instance => {
										this.user = instance;
										ConversationLogger.saveConv(
											this.convo.provateId,
											this.message.user);
										resolve(instance);
									})
									.catch(err => {
										logger.error(err);
										reject(err);
									});
							}

						}).catch(reject)
					}).catch(reject);
					// resolve();
				} else {
					logger.error(err);
					reject(err);
				}
			})
		})
	}

	updateContext(convo) {
		this.convo = convo;
		this.convo.provateId = `${this.convo.source_message.channel}_${this.convo.source_message.timestamp}`;
	}

	showMainMenu() {
		logger.debug('showMainMenu');
		InventoryItem.count().then(count => {
			this.showSubMeny(1, 0, 3, count);
		})

	}

	showSubMeny(page, startId, pageSize, count) {
		logger.debug('showSubMeny');
		InventoryItem.getPage(startId, pageSize).then(items => {

			let ids = [];
			let	q = new GenericTemplate();

			items.forEach(item => {
				ids.push(item.get('id'));
				let templateElement = new GenericElement({
					title: item.get('title'),
					item_url: "",
					image_url: item.get('image'),
					subtitle: item.get('description'),
				}).addButton(new Button({
					action: item.get('id'),
					title: `Buy ${item.get('price')}$`,
					type: Button.POSTBACK,
				}));
				q.addElement(templateElement);

				item.getProductVariants().forEach(variant => {
					templateElement.addButton(new Button({
						action: variant.get('id'),
						title: `${variant.get('title')} ${variant.get('price')}$`,
						type: Button.POSTBACK,
					}))
				})


			});

			if (page * pageSize < count) {
				q.addElement(
					new GenericElement({
						title: 'More Options',
					}).addButton(new Button({
						action: 'MORE',
						title: 'More',
						type: Button.POSTBACK,
					}))
				);
			}

			ConversationLogger.saveMessage(
				`Show product page ${page}`,
				``,
				this.convo.provateId,
				this.message.user);

			this.convo.ask(
				new Attachment(Attachment.TEMPLATE)
					.addPayload(q).getJSON(),
				(response, convo) => {
					this.updateContext(convo);
					if (ids.indexOf(parseInt(response.text)) >= 0) {
						this.checkOut(items.find(item => {
							return item.get('id') === parseInt(response.text);
						}));
						this.convo.next();
					} else if (response.text === 'MORE') {
						this.showSubMeny(page + 1, items[items.length - 1].get('id'), pageSize, count);
						this.convo.next();
					} else {
						this.convo.repeat();
						this.convo.next();
					}

				}
			)

		}).catch(e => {
			logger.error(e)
		})


	}

	checkOut(inventoryItem) {
		this.askSeat(inventoryItem)
			.catch(e => {
				logger.error(e);
			});
		// 	.then(seat_address => {
		// 	// this.convo.ask('Phone Number:', (response, convo) => {
		// 		this.updateContext(convo);
		// 		ted
		// 		this.order.addItem(inventoryItem);
		// 		this.finishOrderStep1();
		// 		this.convo.next();
		// 	// })
		// })

	}

	askSeat(inventoryItem) {
		return new Promise((resolve, reject) => {
			//this.controller.storage.users.get(this.message.user, (err, user) => {
					this.convo.ask('Ok, I love this selection. What is your section/row/seat number 💺:', (response, convo) => {
						let seatAddress = response.text;
						this.updateContext(convo);

						// this.controller.storage.users.save(
						// 	{
						// 		id: this.message.user,
						// 		seatAddress,
						// 	},
						// 	(error) => {
						// 		if (error) {
						// 			logger.error('Error saving user', error);
						// 			this.convo.stop();
						// 			reject(error);
						// 		} else {
									ConversationLogger.saveMessage(
										'Please enter your section/row/seat number 💺:',
										seatAddress,
										this.convo.provateId,
										this.message.user);

									this.order.setSeatAddress(seatAddress);
									this.order.addItem(inventoryItem);
									this.requestUserPhoto();
									this.convo.next();
									resolve(seatAddress);
					// 			}
					// 		}
					// 	);
					});
					// this.convo.next();

				// }
			// }).catch(e => {
			// 	logger.error(e)
			// 	reject(e);
			// })

		})
	}

	requestUserPhoto() {
		const ACTIONS = {
			YES: 'YES',
			NO: 'NO',
		}

		return new Promise((resolve, reject) => {
			this.convo.ask(
				new Attachment(Attachment.TEMPLATE)
					.addPayload(
						new ButtonsTemplate("Do you want to send a photo?")
							.addButton(new Button({
								action: ACTIONS.YES,
								title: 'YES',
								type: Button.POSTBACK,
							}))
							.addButton(new Button({
								action: ACTIONS.NO,
								title: 'No',
								type: Button.POSTBACK,
							}))
					)
					.getJSON(),
				[
					{
						pattern: ACTIONS.YES,
						callback: (response, convo) => {
							ConversationLogger.saveMessage(
								'Do you want to send a photo?',
								ACTIONS.YES,
								this.convo.provateId,
								this.message.user);
							this.updateContext(convo);
							this.convo.ask('Send your photo:', (response, convo) => {
								this.updateContext(convo);
								MessageUtil.loadImage(response.attachments[0]).then(buffer => {
									this.user.update({
										user_photo: buffer,
									}).then(() => {
										this.finishOrderStep1();
										this.convo.next();
									}).catch(reject);
								})
							});
							this.convo.next();
						},
					},
					{
						pattern: ACTIONS.NO,
						callback: (response, convo) => {
							ConversationLogger.saveMessage(
								'Do you want to send a photo?',
								ACTIONS.NO,
								this.convo.provateId,
								this.message.user);
							this.updateContext(convo);
							this.finishOrderStep1();
							this.convo.next();
						},
					},
				])
		})
	}

	finishOrderStep1() {
		const ACTIONS = {
			CHECKOUT: 'CHECKOUT',
			CONTINUE: 'CONTINUE',
		};

		this.convo.ask(
			new Attachment(Attachment.TEMPLATE)
				.addPayload(
					new ButtonsTemplate("Your order is being processed ⌛..")
						.addButton(new Button({
							action: ACTIONS.CHECKOUT,
							title: 'Checkout',
							type: Button.POSTBACK,
						}))
						.addButton(new Button({
							action: ACTIONS.CONTINUE,
							title: 'Add more',
							type: Button.POSTBACK,
						}))
				)
				.getJSON(),
			[
				{
					pattern: ACTIONS.CHECKOUT,
					callback: (response, convo) => {
						ConversationLogger.saveMessage(
							'Checout question',
							ACTIONS.CHECKOUT,
							this.convo.provateId,
							this.message.user);
						this.updateContext(convo);
						this.finishOrderStep2();
						this.convo.next();
						// this.order.save().then(() => {
						
						// })
					},
				},
				{
					pattern: ACTIONS.CONTINUE,
					callback: (response, convo) => {
						ConversationLogger.saveMessage(
							'Checout question',
							ACTIONS.CONTINUE,
							this.convo.provateId,
							this.message.user);
						this.updateContext(convo);
						this.showMainMenu();
						this.convo.next();
					},
				},
				{
					default: true,
					callback: (response, convo) => {
						ConversationLogger.saveMessage(
							'Checkout question',
							response.text,
							this.convo.provateId,
							this.message.user);
						this.updateContext(convo);
						this.convo.repeat();
						this.convo.next();
					},
				},
			]
		);

	}

	finishOrderStep2() {
		const ACTIONS = {
			CONFIRM: 'CONFIRM',
			CANSCEL: 'CANCEL',
		};

		this.convo.say(new Attachment(Attachment.TEMPLATE)
			.addPayload(
				this.order.getOrderTemplate()
			).getJSON());

		this.convo.ask(
			new Attachment(Attachment.TEMPLATE)
				.addPayload(
					new ButtonsTemplate("Please confirm your order for delivery 🏃..")
						.addButton(new Button({
							action: ACTIONS.CONFIRM,
							title: 'Confirm 👍',
							type: Button.POSTBACK,
						}))
						.addButton(new Button({
							action: ACTIONS.CANSCEL,
							title: 'Cancel ❌',
							type: Button.POSTBACK,
						}))
				).getJSON(),
			[
				{
					pattern: ACTIONS.CONFIRM,
					callback: (response, convo) => {
						// var msg = {
					 //      "attachment": {
					 //        "type": "image",
					 //        "payload": {
					 //          "url": 'http://gph.is/1T1xrKT'
					 //        }
					 //      }
					 //    };

						// this.convo.say(msg);
						this.convo.say(' 👌');
          				this.convo.next();
						ConversationLogger.saveMessage(
							'Order confirmation',
							response.text,
							this.convo.provateId,
							this.message.user);
						this.updateContext(convo);
						// this.order.setStatus(Order.FINISHED);
						this.order.save().then(() => {
							this.order = null;
							this.convo.stop();
							this.start();
						})
						
					},
				},
				{
					pattern: ACTIONS.CANSCEL,
					callback: (response, convo) => {
						ConversationLogger.saveMessage(
							'Order confirmation',
							response.text,
							this.convo.provateId,
							this.message.user);
						this.updateContext(convo);
						this.showMainMenu();
						this.convo.next();
					},
				},
				{
					default: true,
					callback: (response, convo) => {
						ConversationLogger.saveMessage(
							'Order confirmation',
							response.text,
							this.convo.provateId,
							this.message.user);
						this.updateContext(convo);
						this.convo.repeat();
						this.convo.next();
					},
				},
			]
		);
	}

}

module.exports = Menu;
