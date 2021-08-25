const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/change_members_delete", async (req, res) => {
    console.log(req.body);
    const member_id = req.body.member_id;
    const chat_id = req.body.chat_id;

    await axios.post('http://event_bus:3000/events', {
        service: "change_members", 
        collection: "user_chat", 
        type: "delete", 
        data: [{ chat_id: chat_id }, { user_id: member_id }]
    });

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

    await axios.post('http://event_bus:3000/events', {
        service: "change_members", 
        collection: "user_chat", 
        type: "insert", 
        data: members_objects
    });

    res.json(true);
});

app.listen(3000, () => {
    console.log("Listening");
});

