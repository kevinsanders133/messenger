const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	user_id: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		required: false
	},
	chat_id: {
		type: String,
		required: true
	},
	chat_name: {
		type: String,
		required: true
	}
});

module.exports = user_chat_schema = mongoose.model('user_chat', schema, 'user_chat');