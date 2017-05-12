'use strict';

const StructuredContent = require('./structured_content');

class PersistentMenu extends StructuredContent {

	static get WEBURL() {return 'web_url'}

	static get POSTBACK() {return 'postback'}

	constructor() {
		super()
		this.structure = {
			setting_type: 'call_to_actions',
			thread_state: 'existing_thread',
			call_to_actions: [],
		}
	}

	/**
	 * Add action to menu
	 * @param obj
	 * {
	 * 	title: "",
	 * 	type: {WEBURL,POSTBACK},
	 * 	action: "" - url or button action, depend on type
	 * }
	 */
	addAction(obj) {

		let action = {};

		if (obj.title === null || obj.title === undefined) {
			throw new Error(`PersistentMenu Action should have title`);
		}

		if (obj.type === null || obj.type === undefined) {
			throw new Error(`PersistentMenu Action should have type`);
		}

		action.title = obj.title;

		if (obj.type === PersistentMenu.WEBURL) {
			action.type = obj.type;
			action.url = obj.action;
		} else if (obj.type === PersistentMenu.POSTBACK) {
			action.type = obj.type;
			action.payload = obj.action;
		} else {
			throw new Error(`PersistentMenu Action has incorrect type: ${obj.type}`);
		}

		this.structure.call_to_actions.push(action);

	}

}


module.exports = PersistentMenu;
