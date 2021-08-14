const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const axios = require("axios");
const cors = require('cors');
const app = express();
const fs = require("fs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/registration?retryWrites=true&w=majority";

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

app.post('/email_confirmation', async (req, res) => {
    if (req.body.password_signup == req.body.password_check_signup) {

        var nickname = req.body.nickname_signup;
        var email = req.body.email_signup;
        var password = req.body.password_signup;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'storytelltom@gmail.com',
                pass: 'putKuSpeChU2<>'
            }
        });
          
        var mailOptions = {
            from: 'storytelltom@gmail.com',
            to: 'storytelltom@gmail.com',
            subject: 'Registration',
            html: 
               `Registration for LibChat.
                Click button to finish registration.
                <form method="POST" action="http://localhost:8080/registration">
                    <input type="hidden" name="nickname_signup" value="${nickname}">
                    <input type="hidden" name="email_signup" value="${email}">
                    <input type="hidden" name="password_signup" value="${password}">
                    <button>Confirm</button>
                </form>`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        
    }
    res.redirect("/");
});
  
app.post('/registration', async (req, res) => {

    const tag = await User.countDocuments({ nickname: req.body.nickname_signup }) + 1;

    const user = await new User({
        nickname: req.body.nickname_signup,
        tag: "#" + String(tag),
        email: req.body.email_signup,
        password: req.body.password_signup
    });

    await user.save();

    await axios.post("http://event_bus:3000/events", {service: "registration", collection: "users", type: "insert", data: user});

    var _id = await User.findOne({ nickname: req.body.nickname_signup, tag: "#" + String(tag) }, '_id');

    console.log(_id);

    const dir = `${__dirname}/uploads/avatars/${_id._id}`;
    fs.mkdirSync(dir);
    const src = `${__dirname}/uploads/no-avatar.png`;
    const dest =  `${dir}/${req.body.nickname_signup}.png`;
    fs.copyFile(src, dest, (err) => {
        if (err) {
            console.log("Error Found:", err);
        }
    });
    res.redirect("/");
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