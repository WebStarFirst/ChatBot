'use strict';

const request = require('request');

class MessageUtils {

	static loadImage(message) {
		return new Promise((resolve, reject) => {

			if (message.type !== 'image' || !message.payload.url) {
				throw new Error(`Message don't contain image`);
			}

			request(message.payload.url, (err, response, buffer) => {
				if (err) {
					reject(err)
				} else {
					resolve(buffer);
				}
			});

		})
	}

}

module.exports = MessageUtils;
