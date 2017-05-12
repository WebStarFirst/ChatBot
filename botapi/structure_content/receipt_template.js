'use strict';

const Template = require('./template');
const ReceiptElement = require('./receipt_element');

class ReceiptTemplate extends Template {

	constructor(obj) {
		super();
		this.structure = {
			template_type: 'receipt',
			recipient_name: obj.name,
			order_number: obj.id,
			currency: 'USD',
			payment_method: 'Cash',
			order_url: '',
			elements: [],
			address: {
				street_1: obj.seat_address,
				street_2: '',
				city: '.',
				postal_code: '.',
				state: '.',
				country: '.',
			},
			summary: {
				subtotal: 0,
				shipping_cost: 0,
				total_tax: 0,
				total_cost: obj.total,
			},
			adjustments: [],
		};
	}

	addElement(element) {
		if (!(element instanceof ReceiptElement)) {
			throw new Error(`ReceiptTemplate can include only ReceiptElement`);
		}
		this.structure.elements.push(element);
		return this;
	}

	getJSON() {
		return Object.assign(
			{},
			this.structure,
			{
				elements: this.structure.elements.map(item => item.getJSON()),
			}
		);
	}

}

module.exports = ReceiptTemplate;
