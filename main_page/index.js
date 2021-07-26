const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server);
const mongoose = require('mongoose')
const fs = require('fs')
var _id;
var avatar;

server.listen(3000);

const user_schema = require("./models/user_schema");
const chat_schema = require("./models/chat_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.set('view engine', 'ejs')
app.use('views', express.static(__dirname + '/views'));

app.use('/main_page/uploads', express.static(__dirname + '/uploads'));
app.use('/main_page/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = [];

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

// routing
app.get('/main_page', async function (req, res) {
	var nickname;
	var chats = [];
	var private_chats = [];
	var group_chats = [];
	var query = [];

	_id = req.query.id;

	const dir = __dirname + '/uploads/avatars/' + _id;

	fs.readdirSync(dir).forEach(file => {
		avatar = file;
	});

	console.log(avatar);

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

					console.log();

					const path = __dirname + '/uploads/groupchats/' + doc[i]["chat_id"] + '/avatar';
					fs.readdirSync(path).forEach(file => {
						group_chats[group_chats.length - 1]["avatar"] = file;
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

io.sockets.on('connection', function (socket) {
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username, roomName){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = roomName;
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join(roomName);
		// echo to room 1 that a person has connected to their room
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data, chat) {
		// insert data into history file
		const history = `${__dirname}/groupchats/${chat}/history/history.html`;
		fs.appendFileSync(history, data);
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', data);
	});	

	socket.on('changeAvatar', function (message, image, chat) {
		// insert data into history file
		const history = `${__dirname}/groupchats/${chat}/history/history.html`;
		fs.appendFileSync(history, message);
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updateAvatar', image);

		io.sockets.in(socket.room).emit('updatechat', message);
	});	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});
