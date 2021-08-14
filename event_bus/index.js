const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.post('/events', async (req, res) => {
    console.log("HI, i'm there");
    const content = req.body;
    axios.post("/events", {
        type: 'Content',
        data: content
    });
    res.send("OK");
});

app.listen(3000, () => {
    console.log('Listening');
});

/*

add_friend
change_info
change_members
chat
create_chat
delete_chat
login
main_page
registation

*/