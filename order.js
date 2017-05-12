'use strict';

const logger = require('./logger');
const OrderModel = require('./models/models').Order;
const OrderItem = require('./models/models').OrderItem;
const ReceiptTemplate = require('./botapi/structure_content/receipt_template');
const ReceiptElement = require('./botapi/structure_content/receipt_element');

class Order {

	// obj {
	// 	seat_address: seat_address,
	// 	status: Order.NEW,
	// 	stadium: 'stadium 1',
	// 	phone: response.text,
	// 	game: 'game 1',
	// }
	// user
	constructor(obj, user) {
		this.order = OrderModel.build(obj);
		this.items = {};
		this.user = user;
	}

	save() {
		return new Promise((resolve, reject) => {
			this.order.save().then((order) => {
				this.order = order;
				logger.debug('saved order', order.get('id'));
				try {
					OrderItem.bulkCreate(
						Object.keys(this.items).map(key => {
							logger.debug('debugging order items', this.items[key].inventoryItem.get('id'),this.order.get('id'));
							return {
								inventory_order_item_id: this.items[key].inventoryItem.get('id'),
								order_id: this.order.get('id'),
								quantity: this.items[key].quantity,
								price: this.items[key].price,
								total: this.items[key].price * this.items[key].quantity,
							}
						})
					).then(() => {
						//logger.debug('bulkCreated',OrderItem);
						resolve(order);
					}).catch(reject)
				}catch (e) {
					logger.debug(e);
					reject(e)
				}
			}).catch(reject)
		})
	}

	setSeatAddress(seatAddress) {
		this.order.set('seat_address', seatAddress);
	}

	addItem(item) {
		if (this.items[item.get('id')] !== null && this.items[item.get('id')] !== undefined) {
			this.items[item.get('id')].quantity++;
		} else {
			this.items[item.get('id')] = {
				quantity: 1,
				price: item.get('price'),
				inventoryItem: item,
			}
		}
	}

	setStatus(status) {
		this.order.set('status', status);
	}

	getTotalPrice() {
		return Object.keys(this.items).reduce(
			(totalPrice, key) => totalPrice + this.items[key].quantity * this.items[key].price,
			0
		);
	}

	getOrderTemplate() {

		logger.debug('getOrderTemplate');

		let template = new ReceiptTemplate({
			name: `${this.user.get('first_name')} ${this.user.get('last_name')}`,
			//id: this.order.get('id'),
			seat_address: this.order.get('seat_address'),
			total: this.getTotalPrice(),
		});

		Object.keys(this.items).forEach(key => {
			let item = this.items[key];
			template.addElement(
				new ReceiptElement(item.price, item.quantity, item.inventoryItem)
			);
		});

		// logger.debug(template.getJSON());

		return template;

		/*let totalPrice = 0;
		let result = `${this.order.get('seat_address')} `;
		result += Object.keys(this.items).reduce((text, key) => {
			let amount = this.items[key].quantity * this.items[key].price;
			totalPrice += amount;
			return `${text} ${this.items[key].inventoryItem.get('title')}  ${this.items[key].quantity}
			 x ${this.items[key].price} = ${amount} `;
		}, '');

		return `${result} Total price: ${totalPrice}`;*/
	}


}

module.exports = Order;
