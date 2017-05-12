'use strict';

const StructuredContent = require('./structured_content');

class Button extends StructuredContent {

	static get WEBURL() {return 'web_url'}

	static get POSTBACK() {return 'postback'}

	constructor(obj) {
		super()

		this.structure = {};

		if (obj.title === null || obj.title === undefined) {
			throw new Error(`Button should have title`);
		}

		if (obj.type === null || obj.type === undefined) {
			throw new Error(`Button should have type`);
		}

		this.structure.title = obj.title;

		if (obj.type === Button.WEBURL) {
			this.structure.type = obj.type;
			this.structure.url = obj.action;
		} else if (obj.type === Button.POSTBACK) {
			this.structure.type = obj.type;
			this.structure.payload = obj.action;
		} else {
			throw new Error(`Button has incorrect type: ${obj.type}`);
		}

	}

}

module.exports = Button;
