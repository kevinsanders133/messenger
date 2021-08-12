const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

const User = require("./models/User");
  
app.post('/login', async (req, res) => {
    var email = req.body.email_signin;
    var password = req.body.password_signin;

    try {
        mongoose.connect(
            mongoAtlasUri,
            { useNewUrlParser: true, useUnifiedTopology: true },
            () => console.log("Mongoose is connected")
        );
    } catch (e) {
        console.log("could not connect");
    }

    var _id = await User.findOne({email: email, password: password}, '_id');

    await mongoose.connection.close();

    if (_id) {
        console.log(_id);
        res.redirect(`/main_page?id=${_id._id}`);
    } else {
        res.redirect('/');
    }

});

app.listen(3000, () => {
    console.log("Listening");
});
