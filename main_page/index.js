const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')
var _id;
var avatar;

const user_schema = require("./models/user_schema");
const chat_schema = require("./models/chat_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.set('view engine', 'ejs')
app.use('views', express.static(__dirname + '/views'));

app.use('/main_page/uploads', express.static(__dirname + '/uploads'));
app.use('/main_page/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

app.get('/pre_main_page', function (req, res) {
	_id = req.query.id;

	const dir = __dirname + '/uploads/avatars/' + _id;

	fs.readdirSync(dir).forEach(file => {
		avatar = file;
	});

	console.log(avatar);

	res.redirect('/main_page');
})

// routing
app.get('/main_page', async function (req, res) {
	var nickname;
	var chats = [];
	var private_chats = [];
	var group_chats = [];
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

	await user_schema.findOne({_id: _id}, '-_id nickname', function(err, doc)
		{
			nickname = doc.nickname;
		});

	await user_chat_schema.find({ user_id: _id }, '-_id', function(err, doc)
	{
		if(doc)
		{
			for (var i = 0; i < doc.length; i++) {
				if (doc[i]["chat_id"].split("_")[0] == "private") {
					private_chats.push({chat_id: doc[i]["chat_id"], chat_name: doc[i]["chat_name"]});
					query.push({chat_id: doc[i]["chat_id"]});
				} else {
					group_chats.push(doc[i]);

					const path = __dirname + '/uploads/groupchats/' + group_chats[i]["chat_id"] + '/avatar';
					fs.readdirSync(path).forEach(file => {
						group_chats[i]["avatar"] = file;
					});
				}
			}
		}
	});

	if (query.length != 0) {
		await user_chat_schema.find({ user_id: { $ne: _id }, $or: query }, '-_id user_id', function(err, doc)
		{
			if(doc)
			{
				for (var i = 0; i < doc.length; i++) {
					const path = __dirname + '/uploads/avatars/' + doc[i]["user_id"];
					fs.readdirSync(path).forEach(file => {
						private_chats[i]["avatar"] = file;
					});

					private_chats[i]["user_id"] = doc[i]["user_id"];
					console.log(private_chats[i]);
				}
			}
		});
	}

	chats = private_chats.concat(group_chats);
	console.log(chats);


	await mongoose.connection.close();

	res.render('index', { chats: chats, friends: private_chats, _id: _id, nickname: nickname, avatar: avatar });

});

app.listen(3000, () => {
	console.log("running on port 3000");
	console.log("--------------------------");
  });


/*

for (var i = 0; i < doc.length; i++) {
	if (doc[i]["chat_id"].split("_")[0] == "private") {
		await user_chat_schema.findOne({ user_id: {$ne :_id}, chat_id: doc[i]["chat_id"] }, '-_id user_id', function(e, c) {
			doc[i]["user_id"] = c.user_id;
		});

		const path = __dirname + '/uploads/avatars/' + doc[i]["user_id"];
		fs.readdirSync(path).forEach(file => {
			doc[i]["avatar"] = file;
		});
	
		private_chats.push({ chat_id: doc[i]["chat_id"], chat_name: doc[i]["chat_name"] });
		query.push({chat_id: doc[i]["chat_id"]});
	} else {
		const path = __dirname + '/uploads/groupchats/' + doc[i]["chat_id"] + '/avatar';
		fs.readdirSync(path).forEach(file => {
			doc[i]["avatar"] = file;
		});
	
	}
}

*/