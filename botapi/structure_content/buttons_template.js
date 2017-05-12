'use strict';

const Template = require('./template');
const Button = require('./button');

class ButtonsTemplate extends Template {

	constructor(text) {
		super();
		this.structure = {
			template_type: 'button',
			text,
			buttons: [],
		};
	}

	addButton(btn) {
		if (btn instanceof Button) {
			this.structure.buttons.push(btn);
		} else {
			throw new Error(`You should add only buttons to button_template.`);
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

module.exports = ButtonsTemplate;
