const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const chat_schema = require("./models/chat_schema");
  
app.post('/send_message', async (req, res) => {
    var content = req.body;
    console.log(content);
		
    let record = await new chat_schema({
        user_id: content.data.user_id,
        nickname: content.data.sender_nickname,
        type: content.data.type,
        content: content.data.message
    });

    await axios.post('http://event_bus:3000/events', {
        service: "send_message", 
        collection: content.collection, 
        type: "insert", 
        data: record
    });

    let object = [{
        user_id: content.data.user_id,
        nickname: content.data.sender_nickname,
        type: content.data.type,
        content: content.data.message
    }];

    res.send(object);
});

app.listen(3000, () => {
    console.log("Listening");
});
