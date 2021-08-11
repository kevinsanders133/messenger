const express = require('express');
const app = express();
const mongoose = require('mongoose');
const del = require('del');

const user_chat_schema = require("./models/user_chat_schema");

app.use(express.urlencoded({ extended: false }));

const jsonParser = express.json();

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";


app.post('/delete_chat', jsonParser, async function (req, res) {
	var _id = req.body.id;
	var chat_id = req.body.chat_id;
	var dir;

	if (chat_id.split("_")[0] == "private") {
		dir = `${__dirname}/uploads/privatechats/${chat_id}`;
	} else {
		dir = `${__dirname}/uploads/groupchats/${chat_id}`;
	}

	try {
        await del(dir);
        console.log(`${dir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`);
    }

	try {
		mongoose.connect(
			mongoAtlasUri,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			() => console.log("Mongoose is connected")
		);
	} catch (e) {
		console.log("could not connect");
	}

	var members;
	await user_chat_schema.find({ user_id: { $ne: _id }, chat_id: chat_id }, '-_id user_id', function (err, doc) {
		members = doc;
	});

	await user_chat_schema.deleteMany({ chat_id: chat_id });

	await mongoose.connection.db.dropCollection(chat_id);

	await mongoose.connection.close();

	res.json({ members: members });

});

app.listen(3000, () => {
	console.log("running");
});
