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

class Menu {

	constructor(bot, message, controller) {
		this.bot = bot;
		this.message = message;
		this.controller = controller;
		this.order = new Order(
			{
				seat_address: '',
				status: Order.NEW,
				stadium: 'stadium 1',
				phone: '',
				game: 'game 1',
			}
		);
		this.convo = null;

		this.start();
	}

	start() {
		this.startConversation().then(() => {
			this.showMainMenu();
		})
	}

	startConversation() {
		return new Promise((resolve, reject) => {
			this.bot.startConversation(this.message, (err, convo) => {
				if (!err) {
					this.updateContext(convo);
					this.bot.getUser(this.message.user).then((userJSON) => {
						UserModel.findById(this.message.user).then(userInstance => {
							if (userInstance !== null) {
								logger.debug(`User ${userInstance.get('id')} found`);
							} else {
								logger.debug(`User ${this.message.user} not found`);
								UserModel.create(Object.assign(
									{
										id: this.message.user,
									},
									userJSON
								))
									.then(instance => {
										logger.log(instance.attributes)
										resolve(instance)
									})
									.catch(err => {
										logger.error(err);
										reject(err)
									});
							}

						}).catch(reject)
					}).catch(reject);
					resolve();
				} else {
					logger.error(err);
					reject(err);
				}
			})
		})
	}

	updateContext(convo) {
		this.convo = convo;
	}

	showMainMenu() {

		InventoryItem.count().then(count => {
			this.showSubMeny(1, 0, 3, count);
		})

	}

	showSubMeny(page, startId, pageSize, count) {
		InventoryItem.getPage(startId, pageSize).then(items => {

			console.log('InventoryItem', items);

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
					title: 'Buy',
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

			ConversationLogger.saveLog('Start convo', `Show product page ${page}`, this.message.user);

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
			logger.error(e);
		})


	}

	checkOut(inventoryItem) {
		this.askSeat(inventoryItem);
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
			this.controller.storage.users.get(this.message.user, (err, user) => {
				if (user && user.get('data') && user.get('data').seatAddress) {
					let seatAddress = user.get('data').seatAddress;
					this.order.setSeatAddress(seatAddress);
					this.order.addItem(inventoryItem);
					this.finishOrderStep1();
					this.convo.next();
					resolve(seatAddress);
				} else {
					let seatAddress = '';
					this.convo.ask({
						text: 'Section Number:',
						quick_replies: new QuickReplies()
							.addVariant({
								title: '1',
								payload: '1',
							})
							.addVariant({
								title: '2',
								payload: '2',
							})
							.addVariant({
								title: '3',
								payload: '3',
							})
							.getJSON(),
					}, (response, convo) => {
						seatAddress += `section: ${response.text}; `;
						this.updateContext(convo);
						this.convo.ask('Seat Number:', (response1, convo1) => {
							seatAddress += `seat: ${response1.text}; `;
							this.updateContext(convo1);
							this.convo.ask('Row Number:', (response2, convo2) => {
								seatAddress += `row: ${response2.text}; `;
								this.updateContext(convo2);
								this.controller.storage.users.save(
									{
										id: this.message.user,
										seatAddress,
									},
									(error) => {
										if (error) {
											logger.error('Error saving user', error);
											this.convo.stop();
											reject(error);
										} else {
											this.order.setSeatAddress(seatAddress);
											this.order.addItem(inventoryItem);
											this.finishOrderStep1();
											this.convo.next();
											resolve(seatAddress);
										}
									}
								);
							});
							this.convo.next();
						});
						this.convo.next();
					})
				}
			}).catch(e => {
				logger.error(e)
				reject(e);
			})

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
					new ButtonsTemplate("Your order is being processed..")
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
						this.updateContext(convo);
						this.order.save().then(() => {
							this.finishOrderStep2();
							this.convo.next();
						})
					},
				},
				{
					pattern: ACTIONS.CONTINUE,
					callback: (response, convo) => {
						this.updateContext(convo);
						this.showMainMenu();
						this.convo.next();
					},
				},
				{
					default: true,
					callback: (response, convo) => {
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
					new ButtonsTemplate("Order action?")
						.addButton(new Button({
							action: ACTIONS.CONFIRM,
							title: 'Confirm',
							type: Button.POSTBACK,
						}))
						.addButton(new Button({
							action: ACTIONS.CANSCEL,
							title: 'Cancel',
							type: Button.POSTBACK,
						}))
				).getJSON(),
			[
				{
					pattern: ACTIONS.CONFIRM,
					callback: (response, convo) => {
						this.updateContext(convo);
						this.order.setStatus(Order.FINISHED);
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
						this.updateContext(convo);
						this.showMainMenu();
						this.convo.next();
					},
				},
				{
					default: true,
					callback: (response, convo) => {
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
