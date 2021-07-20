const express = require('express')
const app = express()
const path = require("path");
const mongoose = require('mongoose')

const user_schema = require("./models/user_schema");
const chat_schema = require("./models/chat_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.set('view engine', 'ejs')
app.use('views', express.static(__dirname + '/views'));

//app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";


// routing
app.get('/main_page', async function (req, res) {
	const _id = req.query.id;
	var nickname;
	var chats = [];
	var private_chats = [];
	var friends = [];
	var query = [];

	try {
		mongoose.connect(
			mongoAtlasUri,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			() => console.log("Mongoose is connected")
		);
	} catch (e) {
		console.log("could not connect");
	}

	await user_schema.findOne({_id: _id}, '-_id nickname', async function(err, doc)
		{
			nickname = doc.nickname;
		});

	await user_chat_schema.find({ user_id: _id }, '-_id', function(err, doc)
	{
		if(doc)
		{
			chats = doc;
			for (var i = 0; i < doc.length; i++) {
				if (doc[i]["chat_id"].split("_")[0] == "private") {
					private_chats.push({ chat_id: doc[i]["chat_id"], chat_name: doc[i]["chat_name"] });
					query.push({chat_id: doc[i]["chat_id"]});
				}
			}
		} 
		else if(!doc) {}
	});

	console.log(private_chats);
	console.log(private_chats[0].chat_id);
	console.log(private_chats.length);

	await user_chat_schema.find({ user_id: {$ne: _id}, $or: query }, '-_id user_id', function(err, doc) {
		for (var i = 0; i < private_chats.length; i++) {
			console.log(private_chats[i].chat_name);
			friends.push({ friend_id: doc[i].user_id, nickname: private_chats[i].chat_name });
		}
	});

	console.log(friends);

	mongoose.connection.close();

	res.render('index', { chats: chats, friends: friends, _id: _id, nickname: nickname });

});

app.listen(3000, () => {
	console.log("running on port 3000");
	console.log("--------------------------");
  });
