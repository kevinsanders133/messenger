const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const services = [  
                    {name: 'login', dbs: ["users"]},
                    {name: 'add_friend', dbs: ["users", "user_chat"]},
                    {name: 'change_info', dbs: ["users"]},
                    {name: 'delete_chat', dbs: ["user_chat"]},
                    {name: 'main_page', dbs: ["users", "user_chat"]},
                    {name: 'registration', dbs: ["users"]},
                    {name: 'chat', dbs: ["users", "user_chat"]},
                    {name: 'forgot_pass', dbs: ["users"]}
                ];

app.post('/events', async (req, res) => {
    const content = req.body;
    console.log(content);
    const temp = services.map(e => {return e});
    const index = temp.map(e => e.name).indexOf(content.service);
    if (index > -1) {
        temp.splice(index, 1);
    }
    console.log(temp);
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].dbs.includes(content.collection) || 
            (content.collection != 'users' && content.collection != 'user_chat' && temp[i].name == 'chat')) {
            await axios.post(`http://${temp[i].name}:3000/events`, {
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
