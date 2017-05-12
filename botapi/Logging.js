'use strict';

const Log = require('../models/models').Log;
const Conversation = require('../models/models').Conversation;

class ConversationLogger {

	constructor() {

	}

	static saveMessage(request, reply, convoId, userId) {
		// Log.create({
		// 	UserId: userId,
		// 	request,
		// 	reply,
		// 	ConversationId: convoId,
		// })
	}

	static saveConv(convoId, userId) {
		// Conversation.create({
		// 	UserId: userId,
		// 	id: convoId,
		// })
	}

}

module.exports = ConversationLogger;
