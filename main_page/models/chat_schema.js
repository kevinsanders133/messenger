const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	user_id: {
		type: String,
		required: true
	},
	chat_id: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = chat_schema = mongoose.model('chats', schema, 'chats');
