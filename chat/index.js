const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const io = require("socket.io")({
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});
const schema = new Schema({
	user_id: {
		type: String,
		required: true
	},
	nickname: {
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

var usernames = {};
var rooms = [];

app.post('/chat', function (req, res) {
	res.render('index', { 
		roomName: req.body.chat,
		chat_name: req.body.chat_name,
		nickname: req.body.nickname,
		_id: req.body._id, 
		avatar: req.body.avatar, 
		user_id: req.body.user_id 
	});
});

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', async function(username, roomName, id){

		socket.username = username;
		socket.room = roomName;
		usernames[username] = username;

		await socket.join(roomName);

		let chat_schema = mongoose.model(roomName, schema, roomName);

		await chat_schema.find({}, function(err, doc) {
			socket.emit('updatechat', doc, roomName.split("_")[0]);
		});

		let query = [];

		await user_chat_schema.find({chat_id: roomName}, '-_id user_id', function(err, doc) {
			query = doc;
		});

		await user_schema.find({$or: query}, function(err, doc) {
			socket.emit('load-members', doc);
		});
	});
	
	socket.on('sendchat', async function (type, message, user_id, sender_nickname) {

		let chat_schema = mongoose.model(socket.room, schema, socket.room);
		
		let record = await new chat_schema({
			user_id: user_id,
			nickname: sender_nickname,
			type: type,
			content: message,
		});

		await record.save();

		let object = [{
			user_id: user_id,
			nickname: sender_nickname,
			type: type,
			content: message,
		}];
		
		await io.sockets.in(socket.room).emit('updatechat', object, socket.room.split("_")[0]);
	});	

	socket.on('changeAvatar', function (image) {
		io.sockets.in(socket.room).emit('updateAvatar', image);
	});	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		socket.leave(socket.room);
	});
});
