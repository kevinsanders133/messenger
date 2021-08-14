const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const services = [  
                    'add_friend',
                    'change_info',
                    'change_members',
                    'chat',
                    'create_chat',
                    'delete_chat',
                    'login',
                    'main_page',
                    'registation'
                ];

app.post('/events', async (req, res) => {
    console.log("HI, i'm there");
    const content = req.body;
    const temp = services;
    const index = temp.indexOf(content.service);
    temp.splice(index, 1);
    for (var i = 0; i < temp.length; i++) {
        await axios.post(`http://${temp[i]}:3000/events`, {
            collection: content.collection,    
            type: content.type,
            data: content.data
        });
    }
    res.send(true);
});

app.listen(3000, () => {
    console.log('Listening');
});
