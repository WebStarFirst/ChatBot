'use strict';

const StructuredContent = require('./structured_content');

class QuickReplies extends StructuredContent {


	constructor() {
		super()
		this.structure = [];
	}

	/**
	 *
	 * @param obj
	 * {
     *   "title":"",
     *   "payload":""
     * }
	 */
	addVariant(obj) {
		if (this.structure.length >= 10) {
			throw new Error('QuickReplies is limited to 10.');
		}

		this.structure.push(Object.assign(
			{
				content_type: 'text',
			},
			obj
		))

		return this;

	}

}

module.exports = QuickReplies;
