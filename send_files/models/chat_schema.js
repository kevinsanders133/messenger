const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	user_id: {
		type: String,
		required: true
	},
	nickname: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = chat_schema = mongoose.model('chat_schema', schema, 'chat_schema');
