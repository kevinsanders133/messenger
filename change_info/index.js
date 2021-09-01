const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios');
const CryptoJS = require('crypto-js');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs')
app.use('views', express.static(__dirname + '/views'));

app.use('/change_info/public', express.static(__dirname + '/public'));

const mongoAtlasUri = process.env.CHANGE_INFO;

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

mongoose.set('useFindAndModify', false);
  
app.post('/change_info_form', async (req, res) => {
    const id = req.body.id;

    var user = await User.findOne({_id: id}, '-_id').exec();

    var nickname = user.nickname;
    var email = user.email;
    var password = user.password;

    const passphrase = process.env.PHRASE;
    const bytes = CryptoJS.AES.decrypt(password, passphrase);
    password = bytes.toString(CryptoJS.enc.Utf8);

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

    const passphrase = process.env.PHRASE;
    const cypher = CryptoJS.AES.encrypt(password, passphrase).toString();

    const user = {
        nickname: nickname,
        email: email,
        password: cypher
    };

    await User.findOneAndUpdate({_id: id}, user, {upsert: true}).exec();
    await axios.post('http://event_bus:3000/events', {
        service: "change_info", 
        collection: "users", 
        type: "update", 
        data: { _id: id, new_data: user }
    });

    res.json(true);
});

app.post('/events', async (req, res) => {
    const content = req.body;
    console.log(content);
    if (content.type == 'insert') {
        const user = await new User(content.data);
        await user.save();
    } else if (content.type == 'delete') {
        await User.deleteOne({$and: content.data}).exec();
    } else {
        await User.findOneAndUpdate({_id: content.data._id}, content.data, {upsert: true}).exec();
    }
    res.send(true);
});

app.listen(3000, () => {
  console.log("Listening");
});
