const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = process.env.FORGOT_PASS;

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

app.set('view engine', 'ejs');
app.use('views', express.static(`${__dirname}/views`));

app.post('/forgot_pass', async (req, res) => {

    const email = req.body.email_forgot;
    const password_encrypted = await User.findOne({email: email}, '-_id password');
    const password = "123";

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
        subject: 'Libchat password',
        text: `Your password is: ${password}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            message = "It seems like this email doesn't exist.";
        } else {
            message = "Check your email.";
        }
        res.render("index", {
            message: message
        });
    });
    res.send("OK");
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