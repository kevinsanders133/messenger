const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	nickname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = user_schema = mongoose.model('users', schema, 'users');
