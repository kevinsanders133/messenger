const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/login?retryWrites=true&w=majority";

try {
    mongoose.connect(
        mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => console.log("Mongoose is connected")
    );
} catch (e) {
    console.log("could not connect");
}

const User = require("./models/User");
  
app.post('/login', async (req, res) => {
    var email = req.body.email_signin;
    var password = req.body.password_signin;

    var _id = await User.findOne({email: email, password: password}, '_id');

    if (_id) {
        console.log(_id);
        res.redirect(`/main_page?id=${_id._id}`);
    } else {
        res.redirect('/');
    }

});

app.post('/events', async (req, res) => {
    const content = req.body;
    if (content.type == 'insert') {
        const user = await new User(content.data);
        await user.save();
    } else if (content.type == 'delete') {

    } else {

    }
    console.log(content);
    console.log(`${content.type}: ${content.data}.`);
    res.send("OK");
});

app.listen(3000, () => {
    console.log("Listening");
});
