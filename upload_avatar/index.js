const express = require('express');
const app = express();
const multer = require('multer');
const fsExtra = require('fs-extra')

app.use(express.json({limit: '1000mb'}));
app.use(express.urlencoded({extended: false, limit: '1000mb'}));

app.post('/upload_avatar', (req, res) => {
    const _id = req.query._id;
    const nickname = req.query.nickname;

    fsExtra.emptyDirSync(`${__dirname}/uploads/avatars/${_id}`);

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `${__dirname}/uploads/avatars/${_id}`);
        },
        filename: function (req, file, cb) {
            cb(null, `${nickname}.png`);
        }
    })
       
    var upload = multer({ storage: storage }).array("myFile", 1);

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.")
        } else if (err) {
            console.log("An unknown error occurred when uploading.")
        }
     
        console.log("Everything went fine.", req.files)
        res.send("Everything went fine.")
    })

});

app.post('/upload_group_avatar', (req, res) => {
    const chat_id = req.query.chat_id;
    
    fsExtra.emptyDirSync(`${__dirname}/uploads/groupchats/${chat_id}/avatar`);

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `${__dirname}/uploads/groupchats/${chat_id}/avatar`);
        },
        filename: function (req, file, cb) {
            cb(null, `${chat_id}.png`);
        }
    })
       
    var upload = multer({ storage: storage }).array("myFile", 1);

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.")
        } else if (err) {
            console.log("An unknown error occurred when uploading.")
        }
     
        console.log("Everything went fine.", req.files)
        res.send("Everything went fine.")
    })

});

app.listen(3000, () => {
    console.log("Listen");
});
