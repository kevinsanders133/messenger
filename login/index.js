const express = require("express");
const mongoose = require("mongoose");
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
    console.log(req.body);
    if (content.type == 'insert') {
        const user = await new User(content.data);
        await user.save();
    } else if (content.type == 'delete') {
        //await user.deleteOne({$and: content.data});
    } else {
        await User.findOneAndUpdate({_id: content.data._id}, content.data.new_data, {upsert: true}).exec();
    }
    res.send(true);
});

app.listen(3000, () => {
    console.log("Listening");
});
