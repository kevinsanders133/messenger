const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const services = [  
                    {name: 'login', dbs: ["users"]}, // users
                    {name: 'add_friend', dbs: ["users", "user_chat"]}, // users user_chat
                    {name: 'change_info', dbs: ["users"]}, // users
                    {name: 'change_members', dbs: ["user_chat"]}, // user_chat
                    {name: 'delete_chat', dbs: ["user_chat"]}, // user_chat
                    {name: 'main_page', dbs: ["users", "user_chat"]},  // users user_chat
                    {name: 'registration', dbs: ["users"]} // users
                ];

app.post('/events', (req, res) => {
    console.log("HI, i'm there");
    const content = req.body;
    const temp = services.map(e => {return e});
    console.log(temp);
    const index = temp.map(e => e.name).indexOf(content.service);
    temp.splice(index, 1);
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].dbs.includes(content.collection)) {
            axios.post(`http://${temp[i].name}:3000/events`, {
                collection: content.collection,    
                type: content.type,
                data: content.data
            });
        }
    }
    res.send(true);
});

app.listen(3000, () => {
    console.log('Listening');
});
