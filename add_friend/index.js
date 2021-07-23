const express = require("express");
const app = express();
const mongoose = require("mongoose");

const user_schema = require("./models/user_schema");
const chat_schema = require("./models/chat_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

app.post("/add_friend", async (req, res) => {
    const sender_nickname = req.body.sender_nickname;
    const reciever_nickname = req.body.reciever_nickname;
    const sender_id = req.body.sender_id;
    const reciever_tag = req.body.reciever_tag;

    try {
		mongoose.connect(
			mongoAtlasUri,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			() => console.log("Mongoose is connected")
		);
	} catch (e) {
		console.log("could not connect");
	}

    var reciever_id = null;
    await user_schema.findOne({ nickname: reciever_nickname, tag: reciever_tag }, '_id', (err, doc) => {
        if (doc != null) {
            reciever_id = doc._id.toString();
        }
    });

    if (reciever_id != null) {
        const index = await chat_schema.countDocuments({}) + 1;

        const name = "private_" + String(index);

        const chat = new chat_schema({ _id: index, name: name });

        await chat.save();

        let sender = new user_chat_schema({
            user_id: sender_id,
            chat_id: name,
            chat_name: reciever_nickname
        });

        let reciever = new user_chat_schema({
            user_id: reciever_id,
            chat_id: name,
            chat_name: sender_nickname
        });

        await sender.save();
        await reciever.save();
    }

    console.log("enddddddddddddddddddddddddddddddddddddddddddddddd");
    await mongoose.connection.close();
    res.redirect("/pre_main_page?id=" + sender_id);
});

app.listen(3000, () => {
    console.log(`running on port 7777`);
    console.log("--------------------------");
});
