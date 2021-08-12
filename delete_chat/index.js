const express = require('express');
const app = express();
const mongoose = require('mongoose');
const del = require('del');

app.use(express.json());

const user_chat_schema = require("./models/user_chat_schema");

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";


app.post('/delete_chat', async function (req, res) {
	var _id = req.body.id;
	var chat_id = req.body.chat_id;

	if (chat_id.split("_")[0] == "private") {
		var dir = `${__dirname}/uploads/privatechats/${chat_id}`;
	} else {
		var dir = `${__dirname}/uploads/groupchats/${chat_id}`;
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

	var members = await user_chat_schema.find({ user_id: { $ne: _id }, chat_id: chat_id }, '-_id user_id');

	await user_chat_schema.deleteMany({ chat_id: chat_id });

	var collections = await mongoose.connection.db.listCollections().toArray();

	for (i = 0; i < collections.length; i++) {
		console.log(collections[i].name);
		if (collections[i].name == chat_id) {
			await mongoose.connection.db.dropCollection(chat_id);
			console.log("HI");
			break;
		}
	}

	await mongoose.connection.close();

	res.json({ members: members });
});

app.listen(3000, () => {
	console.log("Listening");
});
