'use strict';

const StructuredContent = require('./structured_content');
const Button = require('./button');

class GenericElement extends StructuredContent {

	/**
	 *
	 * @param obj
	 * {
	 * 	title: "",
	 * 	item_url: "",
	 * 	image_url: "",
	 * 	subtitle: ""
	 * }
	 */
	constructor(obj) {
		super();
		this.structure = Object.assign({}, obj, {
			buttons: [],
		});
	}

	addButton(btn) {
		if (btn instanceof Button) {
			this.structure.buttons.push(btn);
		} else {
			throw new Error(`You should add only buttons to GenericElement buttons collection.`);
		}
		return this;
	}

	getJSON() {
		return Object.assign(
			{},
			this.structure,
			{
				buttons: this.structure.buttons.map(item => item.getJSON()),
			}
		)
	}

}

module.exports = GenericElement;
