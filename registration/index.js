const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

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

app.get('/registration', (req, res) => {});
  
app.post('/registration', async (req, res) => {
    if (req.body.password_signup == req.body.password_check_signup) {
        const tag = await User.countDocuments({ nickname: req.body.nickname_signup }, function(err, c) {
            return c;
        }) + 1;

        const user = new User({
            nickname: req.body.nickname_signup,
            tag: "#" + String(tag),
            email: req.body.email_signup,
            password: req.body.password_signup
        });
    
        user.save();
    }
    res.redirect("/");
});

app.listen(3000, () => {
  console.log("running on port 3000");
  console.log("--------------------------");
});