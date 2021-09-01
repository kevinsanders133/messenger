const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { randomBytes } = require("crypto");
const cors = require('cors');
const app = express();
const fs = require("fs");
const CryptoJS = require("crypto-js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/registration/public', express.static(`${__dirname}/public`));

app.set('view engine', 'ejs');
app.use('views', express.static(`${__dirname}/views`));

const mongoAtlasUri = process.env.REGISTRATION;

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

app.post('/email_confirmation', async (req, res) => {
    if (req.body.password_signup === req.body.password_check_signup) {

        const nickname = req.body.nickname_signup;
        const email = req.body.email_signup;
        const password = req.body.password_signup;
        var message;

        const emails_promise = await User.find({}, '-_id email');
        console.log(Array.isArray(emails_promise));
        var emails = [];
        
        for (let i = 0; i < emails_promise.length; i++) {
            emails.push(emails_promise[i].email);
        }

        if (!emails.includes(email)) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS
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
                    message = "It seems like this email doesn't exist.";
                } else {
                    message = "Check your email and confirm registration.";
                }
                res.render("index", {
                    message: message
                });
            });
        } else {
            message = "This email is already in use.";
            res.render("index", {
                message: message
            });
        }
    }
});
  
app.post('/registration', async (req, res) => {

    const tag = randomBytes(3).toString("hex").toUpperCase();

    const passphrase = process.env.PHRASE;
    const cypher = CryptoJS.AES.encrypt(req.body.password_signup, passphrase).toString();

    const user = await new User({
        nickname: req.body.nickname_signup,
        tag: "#" + String(tag),
        email: req.body.email_signup,
        password: cypher
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
    console.log(content);
    if (content.type == 'insert') {
        const user = await new User(content.data);
        await user.save();
    } else if (content.type == 'delete') {

    } else {
        await User.findOneAndUpdate({_id: content.data._id}, content.data.new_data, {upsert: true}).exec();
    }
    res.send(true);
});

app.listen(3000, () => {
  console.log("Listening");
});