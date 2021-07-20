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

    await User.findOne({email: email, password: password}, '_id', function(err, doc)
    {     
        mongoose.connection.close();
        if(doc)
        {
            console.log(doc._id);
            res.redirect('/main_page?id=' + doc._id);
        }
        else if(!doc) {
            res.redirect('/');
        }
    });

});

app.listen(3000, () => {
  console.log(`running on port 3000`);
  console.log("--------------------------");
});
