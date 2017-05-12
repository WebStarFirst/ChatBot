'use strict';

const StructuredContent = require('./structured_content');

class ReceiptElement extends StructuredContent {

	/**
	 *
	 * @param obj
	 * {
	 *   "title":"Classic White T-Shirt",
	 *   "subtitle":"100% Soft and Luxurious Cotton",
	 *   "quantity":2,
	 *   "price":50,
	 *   "currency":"USD",
	 *   "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
	 * }
	 */
	constructor(price, quantity, item) {
		super();
		this.structure = {
			title: item.get('title'),
			subtitle: item.get('description'),
			quantity,
			price,
			currency: 'USD',
			image_url: item.get('image'),

		};
	}

}

module.exports = ReceiptElement;
