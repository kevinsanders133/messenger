const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')

const chat_schema = require("./models/chat_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";


app.get('/delete_chat', async function (req, res) {
	var _id = req.query.id;
	var chat_id = req.query.chat_id;
	var dir;

	if (chat_id.split("_")[0] == "private") {
		dir = `${__dirname}/uploads/private_chats/${chat_id}`;
	} else {
		dir = `${__dirname}/uploads/group_chats/${chat_id}`;
	}

	fs.rmdirSync(dir, { recursive: true });

	try {
		mongoose.connect(
			mongoAtlasUri,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			() => console.log("Mongoose is connected")
		);
	} catch (e) {
		console.log("could not connect");
	}

	await chat_schema.deleteOne({ chat_id: chat_id }, function (err) {
		if (err) return handleError(err);
	});

	await user_chat_schema.deleteMany({ name: chat_id }, function (err) {
		if (err) return handleError(err);
	});

	await mongoose.connection.close();

	res.redirect("/pre_main_page?id=" + _id);

});

app.listen(3000, () => {
	console.log("running on port 3000");
	console.log("--------------------------");
});
