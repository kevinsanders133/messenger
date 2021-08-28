const express = require('express');
const app = express();
const mongoose = require('mongoose');
const axios = require('axios');
const del = require('del');

app.use(express.json());

const user_chat_schema = require("./models/user_chat_schema");

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = process.env.DELETE_CHAT;

try {
	mongoose.connect(
		mongoAtlasUri,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		() => console.log("Mongoose is connected")
	);
} catch (e) {
	console.log("could not connect");
}


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

	var members = await user_chat_schema.find({ user_id: { $ne: _id }, chat_id: chat_id }, '-_id user_id').exec();

	await axios.post('http://event_bus:3000/events', {
        service: "delete_chat", 
        collection: "user_chat", 
        type: "delete", 
        data: [{ chat_id: chat_id }]
    });

	res.json({ members: members });
});

app.post('/events', async (req, res) => {
    const content = req.body;
    console.log(content);
    if (content.type == 'insert') {
        await user_chat_schema.insertMany(content.data);
    } else if (content.type == 'delete') {
        await user_chat_schema.deleteOne({$and: content.data});
    } else {
        
    }
    res.send(true);
});

app.listen(3000, () => {
	console.log("Listening");
});
