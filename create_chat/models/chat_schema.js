const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	name: {
		type: String,
		required: true
	},
});

module.exports = chat_schema = mongoose.model('chats', schema, 'chats');
