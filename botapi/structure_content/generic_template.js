'use strict';

const Template = require('./template');
const GenericElement = require('./generic_element');

class GenericTemplate extends Template {

	constructor() {
		super();
		this.structure = {
			template_type: 'generic',
			elements: [],
		};
	}

	addElement(element) {
		if (!(element instanceof GenericElement)) {
			throw new Error(`GenericTemplate can include only GenericElement`);
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
		)
	}

}

module.exports = GenericTemplate;
