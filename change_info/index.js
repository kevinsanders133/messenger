const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.urlencoded({ extended: false }));

const jsonParser = express.json();

app.set('view engine', 'ejs')
app.use('views', express.static(__dirname + '/views'));

app.use('/change_info/public', express.static(__dirname + '/public'));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

const User = require("./models/User");

try {
    mongoose.connect(
        mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => console.log("Mongoose is connected")
    );
} catch (e) {
    console.log("could not connect");
}
  
app.post('/change_info_form', async (req, res) => {
    const id = req.body.id;
    var nickname;
    var email;
    var password;
    await User.findOne({_id: id}, '-_id', function(err, doc)
    {     
        nickname = doc.nickname;
        email = doc.email;
        password = doc.password;
    });
    res.render("index", {
        id: id,
		nickname: nickname,
        email: email,
        password: password
    });
});

app.post('/change_info_form', async (req, res) => {
    const id = req.body.id;
    var nickname;
    var email;
    var password;
    await User.findOne({_id: id}, '-_id', function(err, doc)
    {     
        nickname = doc.nickname;
        email = doc.email;
        password = doc.password;
    });
    res.render("index", {
        id: id,
		nickname: nickname,
        email: email,
        password: password
    });
});

app.post('/change_info', jsonParser, async (req, res) => {
    const id = req.body.id;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;

    const user = {
        nickname: nickname,
        email: email,
        password: password
    };

    await User.findOneAndUpdate({_id: id}, user, {upsert: true}, function(err, doc)
    {     
        if (err) console.log(err);
    });

    res.json();

});

app.listen(3000, () => {
  console.log(`running`);
});
