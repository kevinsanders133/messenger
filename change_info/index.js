const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

const User = require("./models/User");
  
app.post('/change_info_form', async (req, res) => {
    const id = req.body.id;
    
});

app.post('/change_info_form', async (req, res) => {
    const id = req.body.id;

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
        
    });

});

app.listen(3000, () => {
  console.log(`running`);
});
