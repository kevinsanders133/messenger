const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const io = require("socket.io")({
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});
let chat_schema = null;
const schema = new Schema({
	user_id: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

// either
const server = require("http").Server(app);

io.attach(server, {
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
});

server.listen(3000);

const mongoAtlasUri = "mongodb+srv://kevinsanders:skripka@cluster0.0paig.mongodb.net/app?retryWrites=true&w=majority";

try {
	mongoose.connect(
		mongoAtlasUri,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		() => console.log("Mongoose is connected")
	);
} catch (e) {
	console.log("could not connect");
}

app.use('/chat/public', express.static(`${__dirname}/public`));

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }));

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = [];

// routing
app.post('/chat', function (req, res) {
	res.render('index', { 
		roomName: req.body.chat, 
		nickname: req.body.nickname,
		_id: req.body._id, 
		avatar: req.body.avatar, 
		user_id: req.body.user_id 
	});
});

io.sockets.on('connection', function (socket) {
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', async function(username, roomName){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = roomName;
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join(roomName);

		let history = [];

		if (chat_schema === null) {
			chat_schema = mongoose.model(roomName, schema, roomName);
		}

		await chat_schema.find({}, function(err, doc) {
			if (doc) history = doc;
		});

		await socket.emit('loadhistory', history);

		// echo to client they've connected
		await socket.emit('updatechat', 'You have connected to ' + roomName);
		// echo to room 1 that a person has connected to their room
		await socket.broadcast.to(roomName).emit('updatechat', username + ' has connected to this room');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', async function (type, message, user_id, sender_nickname) {
		console.log("ZDAROVA");
		
		let record = await new chat_schema({
			user_id: user_id,
			type: type,
			content: message,
		});

		await record.save();
		
		// we tell the client to execute 'updatechat' with 4 parameters
		await io.sockets.in(socket.room).emit('updatechat', type, message, user_id, sender_nickname);
	});	

	socket.on('changeAvatar', function (message, image, chat) {
		// insert data into history file
		var history;
		if (socket.room.split("_")[0] == "private") {
			history = `${__dirname}/uploads/privatechats/${chat}/history/history.html`;
		} else {
			history = `${__dirname}/uploads/groupchats/${chat}/history/history.html`;
		}
		fs.appendFileSync(history, data);
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
