const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/send_email?retryWrites=true&w=majority";

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
            user: 'storytelltom@gmail.com',
            pass: 'putKuSpeChU2<>'
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