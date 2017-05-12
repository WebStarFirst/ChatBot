'use strict';

const StructuredContent = require('./structured_content');
const Template = require('./template');
const QuickReplies = require('./quick_replies');

class Attachment extends StructuredContent {

	static get IMAGE() { return 'image' }

	static get TEMPLATE() {return 'template'}

	constructor(type) {
		super();

		if (!type || (type !== Attachment.IMAGE && type !== Attachment.TEMPLATE)) {
			throw new Error(`Attachment should proper type`);
		}

		this.structure = {
			attachment: {
				type,
				payload: {},
			},
		};
	}

	addPayload(payload) {
		if (this.structure.attachment.type === Attachment.IMAGE) {
			this.structure.attachment.payload.url = payload;
			return this;
		}

		if (!(payload instanceof Template)) {
			throw new Error(`Only templates can be added to Attachment`);
		}
		this.structure.attachment.payload = payload;

		return this;
	}

	getJSON() {
		if (this.structure.attachment.payload instanceof Template) {
			// this.structure.attachment.payload = this.structure.attachment.payload.getJSON();
			let result = Object.assign(
				{},
				this.structure,
				{
					attachment: Object.assign(
						{},
						this.structure.attachment,
						{
							payload: this.structure.attachment.payload.getJSON(),
						}
					),
				}

			)

			if (this.structure.quick_replies) {
				result.quick_replies = this.structure.quick_replies.getJSON();
			}

			return result;
		}
		return this.structure;

	}

	addQuickReplies(quickReplies) {
		if (quickReplies instanceof QuickReplies) {
			this.structure.quick_replies = quickReplies;
		} else {
			throw new Error('quickReplies should be instance of QuickReplies structured object');
		}
		return this;
	}

}

module.exports = Attachment;
