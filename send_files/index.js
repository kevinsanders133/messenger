const express = require('express');
const app = express();
const multer = require('multer');

app.use(express.json({limit: '1000mb'}));
app.use(express.urlencoded({extended: false, limit: '1000mb'}));

app.post('/send_files', (req, res) => {
    const chatName = req.query.chatName;
    const nickname = req.query.nickname;
    const milis = String(Date.now());

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + "/groupchats/" + chatName + "/files")
        },
        filename: function (req, file, cb) {
            cb(null, milis + file.originalname)
        }
    })
       
    var upload = multer({ storage: storage }).array("myFile", 4)

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          console.log("A Multer error occurred when uploading.")
        } else if (err) {
          // An unknown error occurred when uploading.
          console.log("An unknown error occurred when uploading.")
        }
     
        // Everything went fine.
        console.log("Everything went fine.", req.files)
        res.send(milis);
    })

});

app.listen(3000, () => {
    console.log("send_files)))))");
});
