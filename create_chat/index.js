const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs")

app.use(express.urlencoded({ extended: false }));

const user_schema = require("./models/user_schema");
const chat_schema = require("./models/chat_schema");
const user_chat_schema = require("./models/user_chat_schema");

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";


app.post("/create_chat", async (req, res) => {
    const sender_id = req.body.sender_id;
    const recievers_ids = req.body.reciever_id;
    const name = req.body.name;

    if (recievers_ids != undefined) {
        try {
            mongoose.connect(
                mongoAtlasUri,
                { useNewUrlParser: true, useUnifiedTopology: true },
                () => console.log("Mongoose is connected")
            );
        } catch (e) {
            console.log("could not connect");
        }
    
        const index = await chat_schema.countDocuments({}) + 1;

        const chat_id = "group_" + String(index);

        const dir_main = `${__dirname}/uploads/groupchats/${chat_id}`;
		fs.mkdirSync(dir_main);

		const dir_history = `${__dirname}/uploads/groupchats/${chat_id}/history`;
		fs.mkdirSync(dir_history);
        
		const file_history = `${__dirname}/uploads/groupchats/${chat_id}/history/history.html`;
		fs.appendFile(file_history, '', function (err) {
			if (err) throw err;
		}); 

		const dir_files = `${__dirname}/uploads/groupchats/${chat_id}/files`;
		fs.mkdirSync(dir_files);

		const dir_avatar = `${__dirname}/uploads/groupchats/${chat_id}/avatar`;
		fs.mkdirSync(dir_avatar);

        const src = `${__dirname}/uploads/no-avatar.png`;
        const dest =  `${dir_avatar}/no-avatar.png`;
        fs.copyFile(src, dest, (err) => {
            if (err) {
            console.log("Error Found:", err);
            }
        });

        const chat = new chat_schema({
            _id: index, 
            name: chat_id
        });

        await chat.save();

        var members = [];
        members.push({
            user_id: sender_id,
            chat_id: chat_id,
            chat_name: name
        });
        for (var i = 0; i < recievers_ids.length; i++) {
            members.push({
                user_id: recievers_ids[i],
                chat_id: chat_id,
                chat_name: name
            });
        }

        console.log(members);

        await user_chat_schema.insertMany(members).then(function(){
            console.log("Data inserted")  // Success
        }).catch(function(error){
            console.log(error)      // Failure
        });

        await mongoose.connection.close();
    }

    res.redirect("/pre_main_page?id=" + sender_id);
});

app.listen(3000, () => {
    console.log(`running on port 7777`);
    console.log("--------------------------");
});

