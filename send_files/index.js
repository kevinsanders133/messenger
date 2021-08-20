const express = require('express');
const app = express();
const multer = require('multer');
const axios = require('axios');

app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({limit: '200mb', extended: false}));

const chat_schema = require("./models/chat_schema");

app.post('/send_files_info', async (req, res) => {
    const content = req.body;
    
    const arr = content.data;
    for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        const record = await new chat_schema({
            user_id: e.user_id,
            nickname: e.nickname,
            type: e.type,
            content: e.content
        });
    
        await axios.post('http://event_bus:3000/events', {
            service: "send_files", 
            collection: content.collection, 
            type: "insert", 
            data: record
        });
    }

    res.send(true);
});

app.post('/send_files', (req, res) => {
    const milis = String(Date.now());

    if (req.query.chat_name.split("_")[0] == "private") {
        var path = `${__dirname}/uploads/privatechats/${req.query.chat_name}/files`;
    } else {
        var path = `${__dirname}/uploads/groupchats/${req.query.chat_name}/files`;
    }

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, `${milis}${file.originalname}`);
        }
    });
       
    var upload = multer({ storage: storage }).array("myFile", 50);

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.")
        } else if (err) {
            console.log("An unknown error occurred when uploading.")
        }
        console.log("Everything went fine.", req.files)
        res.send(milis);
    });
});

app.listen(3000, () => {
    console.log('Listening');
});
