const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = process.env.SEND_EMAIL;

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


app.post('/send_email', (req, res) => {

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
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.redirect("/");
});

app.listen(3000, () => {
  console.log("Listening");
});