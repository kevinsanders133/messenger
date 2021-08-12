const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

    var user = await User.findOne({_id: id}, '-_id');

    var nickname = user.nickname;
    var email = user.email;
    var password = user.password;

    res.render("index", {
        id: id,
		nickname: nickname,
        email: email,
        password: password
    });
});

app.post('/change_info', async (req, res) => {
    const id = req.body.id;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;

    const user = {
        nickname: nickname,
        email: email,
        password: password
    };

    await User.findOneAndUpdate({_id: id}, user, {upsert: true});
    res.json(true);
});

app.listen(3000, () => {
  console.log("Listening");
});
