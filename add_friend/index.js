const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const { ObjectID } = require('mongodb');

app.use(express.urlencoded({ extended: false }));

async function runMongo(sender_nickname, sender_id, reciever_nickname, reciever_tag) {

    const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";
    const client = new MongoClient(mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("mongodb is connected");

        const db = client.db("app");
        const senders_id_obj = new ObjectID(sender_id);

        var reciever_id;
        db.collection("users").findOne({ nickname: reciever_nickname, tag: reciever_tag }, '_id', (err, doc) => {
            reciever_id = doc._id.toString();
        });

        const index = await db.collection("chats").countDocuments({}) + 1;

        const name = "private_" + String(index);

        await db.collection("chats").insertOne({ _id: index, name: name });

        console.log(sender_nickname);
        console.log(reciever_id);

        let sender = {
            user_id: sender_id,
            chat_id: name,
            chat_name: reciever_nickname
        };

        let reciever = {
            user_id: reciever_id,
            chat_id: name,
            chat_name: sender_nickname
        };

        await db.collection("user_chat").insertMany([sender, reciever]);


    } catch (e) {
        console.log(e);
    }
    finally {
        await client.close();
    }
}

app.post("/add_friend", async (req, res) => {
    const sender_nickname = req.body.sender_nickname;
    const reciever_nickname = req.body.reciever_nickname;
    const sender_id = req.body.sender_id;
    const reciever_tag = req.body.reciever_tag;

    await runMongo(sender_nickname, sender_id, reciever_nickname, reciever_tag).catch(console.error);

    console.log("enddddddddddddddddddddddddddddddddddddddddddddddd");
    res.redirect("/main_page?id=" + sender_id);
});

app.listen(3000, () => {
    console.log(`running on port 7777`);
    console.log("--------------------------");
});
