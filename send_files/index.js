const express = require('express');
const app = express();
const multer = require('multer');

app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({limit: '200mb', extended: false}));

app.post('/send_files', (req, res) => {
    const chatName = req.query.chatName;
    const milis = String(Date.now());

    if (chatName.split("_")[0] == "private") {
        var path = `${__dirname}/uploads/privatechats/${chatName}/files`;
    } else {
        var path = `${__dirname}/uploads/groupchats/${chatName}/files`;
    }

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, `${milis}${file.originalname}`);
        }
    });
       
    var upload = multer({ storage: storage }).array("myFile", 10);

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
    console.log("Listening");
});
