const express = require('express');
const app = express();
const multer = require('multer');

app.use(express.json({limit: '1000mb'}));
app.use(express.urlencoded({extended: false, limit: '1000mb'}));

//app.use(express.static(__dirname + '/uploads'));

app.post('/send_files', (req, res) => {
    const chatName = req.query.chatName;
    const nickname = req.query.nickname;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log(__dirname);
            cb(null, __dirname + "/histories/" + chatName + "/files")
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

    //const url = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";
       
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
        res.send("Everything went fine.")
    })

});

app.listen(3000, () => {
    console.log("send_files)))))");
});
