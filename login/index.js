const express = require("express");
const mongoose = require("mongoose");
const CryptoJS = require('crypto-js');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = process.env.LOGIN;

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
const User = require("./models/User");
  
app.post('/login', async (req, res) => {
    var email = req.body.email_signin;
    var password = req.body.password_signin;

    var obj = await User.findOne({email: email}, '_id password');

    const passphrase = process.env.PHRASE;
    const bytes = CryptoJS.AES.decrypt(obj.password, passphrase);
    decrypted_password = bytes.toString(CryptoJS.enc.Utf8);

    if (password == decrypted_password) {
        console.log(decrypted_password);
        res.redirect(`/main_page?id=${obj._id}`);
    } else {
        res.redirect('/');
    }

});

app.post('/events', async (req, res) => {
    const content = req.body;
    console.log(req.body);
    if (content.type == 'insert') {
        const user = await new User(content.data);
        await user.save();
    } else {
        await User.findOneAndUpdate({_id: content.data._id}, content.data.new_data, {upsert: true}).exec();
    }
    res.send(true);
});

app.listen(3000, () => {
    console.log("Listening");
});
