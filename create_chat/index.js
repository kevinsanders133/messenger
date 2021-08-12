const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const user_schema = require("./models/user_schema");
const user_chat_schema = require("./models/user_chat_schema");

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

app.post("/create_chat", async (req, res) => {
    const sender_id = req.body.sender_id;
    const recievers_ids = req.body.recievers_ids;
    const name = req.body.name;

    try {
        mongoose.connect(
            mongoAtlasUri,
            { useNewUrlParser: true, useUnifiedTopology: true },
            () => console.log("Mongoose is connected")
        );
    } catch (e) {
        console.log("could not connect");
    }

    const chat_id = `group_${String(Date.now())}`;

    const dir_main = `${__dirname}/uploads/groupchats/${chat_id}`;
    fs.mkdirSync(dir_main);

    const dir_files = `${__dirname}/uploads/groupchats/${chat_id}/files`;
    fs.mkdirSync(dir_files);

    const dir_avatar = `${__dirname}/uploads/groupchats/${chat_id}/avatar`;
    fs.mkdirSync(dir_avatar);

    const src = `${__dirname}/uploads/no-avatar.png`;
    const dest =  `${dir_avatar}/no-avatar.png`;
    fs.copyFile(src, dest, (err) => {
        if (err) {
            console.log("Error Found:", err);
        }
    });

    var members = [];
    members.push({
        user_id: sender_id,
        admin: true,
        chat_id: chat_id,
        chat_name: name
    });
    for (var i = 0; i < recievers_ids.length; i++) {
        members.push({
            user_id: recievers_ids[i],
            admin: false,
            chat_id: chat_id,
            chat_name: name
        });
    }

    console.log(members);

    await user_chat_schema.insertMany(members);

    await mongoose.connection.close();

    res.json({ chat_id: chat_id });
});

app.listen(3000, () => {
    console.log("Listening");
});

