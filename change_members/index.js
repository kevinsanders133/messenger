const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const user_chat_schema = require("./models/user_chat_schema");

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/change_members?retryWrites=true&w=majority";

try {
    mongoose.connect(
        mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => console.log("Mongoose is connected")
    );
} catch (e) {
    console.log("could not connect");
}

app.post("/change_members_delete", async (req, res) => {
    const member_id = req.body.member_id;
    const chat_id = req.body.chat_id;

    await user_chat_schema.deleteOne({chat_id: chat_id, user_id: member_id});

    res.json(true);
});

app.post("/change_members_add", async (req, res) => {
    const members = req.body.members;
    const chat_id = req.body.chat_id;
    const chat_name = req.body.chat_name;

    let members_objects = [];
    members.forEach(member => {
        var new_member = {
            user_id: member.id,
            admin: false,
            chat_id: chat_id,
            chat_name: chat_name
        };
        members_objects.push(new_member);
    });

    await user_chat_schema.insertMany(members_objects);

    res.json(true);
});

app.post('/events', async (req, res) => {
    const content = req.body;
    console.log(content);
    if (content.type == 'insert') {
        await user_chat_schema.insertMany(content.data);
    } else if (content.type == 'delete') {
        //await user.deleteOne({$and: content.data});
    } else {
        
    }
    res.send(true);
});

app.listen(3000, () => {
    console.log("Listening");
});

