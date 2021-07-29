const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs")

const user_schema = require("./models/user_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.use(express.urlencoded({ extended: false }));

const jsonParser = express.json();

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

app.post("/add_friend", jsonParser, async (req, res) => {
    const sender_nickname = req.body.sender_nickname;
    const reciever_nickname = req.body.reciever_nickname;
    const sender_id = req.body.sender_id;
    const reciever_tag = req.body.reciever_tag;
    var query = [];
    var ids = [];
    var name = null;
    var avatar;

    console.log(sender_nickname + "\n" + reciever_nickname + "\n" + sender_id + "\n" + reciever_tag);

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

    if (reciever_id == sender_id) {
        reciever_id = null;
    }
    
    if (reciever_id != null) {

        console.log("1111111111111111");

        await user_chat_schema.find({ user_id: sender_id, chat_id: { $regex: '^private.*' } }, '-_id chat_id', function(err, doc)
        {
            if(doc)
            {
                query = doc;
            }
        });

        if (query.length != 0) {

            console.log("2222222222222222");

            await user_chat_schema.find({ user_id: { $ne: sender_id }, $or: query }, '-_id user_id', function(err, doc)
            {
                if(doc)
                {
                    for (var i = 0; i < doc.length; i++) {
                        ids.push(doc[i]["user_id"]);
                    }
                }
            });
        }

        if (ids.includes(reciever_id)) {
            reciever_id = null;
        }

        if (reciever_id != null) {

            console.log("3333333333333333333333333");

            const path = `${__dirname}/uploads/avatars/${reciever_id}`;
				fs.readdirSync(path).forEach(file => {
				avatar = file;
			});

            name = `private_${String(Date.now())}`;

            const dir_main = `${__dirname}/uploads/privatechats/${name}`;
            fs.mkdirSync(dir_main);

            const dir_files = `${__dirname}/uploads/privatechats/${name}/files`;
            fs.mkdirSync(dir_files);

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
    }

    await mongoose.connection.close();
    res.json({ chat_id: name,
               reciever_id: reciever_id,
               avatar: avatar});
});

app.listen(3000, () => {
    console.log(`running`);
});
