'use strict';

class StructuredContent {

	getJSON() {
		return this.structure
	}

}

class Template extends StructuredContent {

	constructor() {
		super()
	}

}

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

		if (obj.type == Button.WEBURL) {
			this.structure.type = obj.type;
			this.structure.url = obj.action;
		} else if (obj.type == Button.POSTBACK) {
			this.structure.type = obj.type;
			this.structure.payload = obj.action;
		} else {
			throw new Error(`Button has incorrect type: ${obj.type}`);
		}

	}

}

class Attachment extends StructuredContent {

	static get IMAGE() {return 'image'}

	static get TEMPLATE() {return 'template'}

	constructor(type){
		super()

		if (!type || (type != Attachment.IMAGE && type != Attachment.TEMPLATE )) {
			throw new Error(`Attachment should proper type`);
		}

		this.structure = {
			attachment: {
				type: type,
				payload: {}
			}
		}
	}

	addPayload(payload){
		if (this.structure.attachment.type == Attachment.IMAGE) {
			this.structure.attachment.payload.url = payload;
			return this;
		}

		if (!(payload instanceof Template)) {
			throw new Error(`Only templates can be added to Attachment`);
		}
		this.structure.attachment.payload = payload;

		return this;
	}

	getJSON(){
		if (this.structure.attachment.payload  instanceof Template) {
			// this.structure.attachment.payload = this.structure.attachment.payload.getJSON();
			let result = Object.assign(
					{},
					this.structure,
					{
						attachment: Object.assign(
							{},
							this.structure.attachment,
							{
								payload: this.structure.attachment.payload.getJSON()
							}
						)
					}

				)
			return result;
		}
		return this.structure;

	}

}

class ButtonsTemplate extends Template {

	constructor(text) {
		super()
		this.structure = {
			template_type: 'button',
			text,
			buttons: []
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
				buttons: this.structure.buttons.map(item => item.getJSON())
			}
		)
	}

}

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
	constructor(obj){
		super()
		this.structure = Object.assign({}, obj, {
			buttons: []
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
				buttons: this.structure.buttons.map(item => item.getJSON())
			}
		)
	}

}

class GenericTemplate extends Template {

	constructor(){
		super()
		this.structure = {
			template_type: 'generic',
			elements: []
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
				elements: this.structure.elements.map(item => item.getJSON())
			}
		)
	}

}

module.exports.Button = Button;
module.exports.Attachment = Attachment;
module.exports.ButtonsTemplate = ButtonsTemplate;
module.exports.GenericElement = GenericElement;
module.exports.GenericTemplate = GenericTemplate;