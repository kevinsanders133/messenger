const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");

app.use(express.urlencoded({ extended: false }));

async function runMongo(sender_id, recievers_ids, name) {

    const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";
    const client = new MongoClient(mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("mongodb is connected");

        const db = client.db("app");

        const index = await db.collection("chats").countDocuments({}) + 1;

        const chat_id = "group_" + String(index);

        await db.collection("chats").insertOne({ _id: index, name: chat_id });

        var recievers = [];

        let reciever = {
            user_id: sender_id,
            chat_id: chat_id,
            chat_name: name
        };
        recievers.push(reciever);

        for (var i = 0; i < recievers_ids.length; i++) {
            let reciever = {
                user_id: recievers_ids[i],
                chat_id: chat_id,
                chat_name: name
            };
            recievers.push(reciever);
        }

        await db.collection("user_chat").insertMany(recievers);


    } catch (e) {
        console.log(e);
    }
    finally {
        await client.close();
    }
}

app.post("/create_chat", async (req, res) => {
    const sender_id = req.body.sender_id;
    const recievers_ids = req.body.reciever_id;
    const name = req.body.name;

    if (recievers_ids != undefined) {
        await runMongo(sender_id, recievers_ids, name).catch(console.error);
    }

    res.redirect("/pre_main_page?id=" + sender_id);
});

app.listen(3000, () => {
    console.log(`running on port 7777`);
    console.log("--------------------------");
});

