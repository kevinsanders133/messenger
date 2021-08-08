const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const user_schema = require("./models/user_schema");
const user_chat_schema = require("./models/user_chat_schema");
const io = require("socket.io")({
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});

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

app.use('/chat/public', express.static(`${__dirname}/public`));

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }));

var users = {};
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

		
		socket.room = roomName;
		users[id] = socket.id;

		await socket.join(roomName);

		console.log(socket);

		let chat_schema = mongoose.model(roomName, schema, roomName);

		await chat_schema.find({}, function(err, doc) {
			socket.emit('updatechat', doc, roomName.split("_")[0]);
		});

		if (roomName.split("_")[0] == "group") {
			let query = [];
			let friends = [];
			let admin;
			let temp;

			admin = await user_chat_schema.findOne({user_id: id, chat_id: roomName}, '-_id admin');
			console.log(admin);

			temp = await user_chat_schema.find({user_id: id, chat_id: {$regex: /^private.*/}}, '-_id chat_id');
			console.log(temp);

			query = temp;

			temp = await user_chat_schema.find({$or: query, user_id: {$ne: id}}, '-_id user_id');
			console.log(temp);

			for (var i = 0; i < temp.length; i++) {
				friends.push({_id: temp[i].user_id});
			}

			console.log(friends);

			temp = await user_schema.find({$or: friends});
			console.log(temp);

			friends = temp;

			query = [];

			temp = await user_chat_schema.find({chat_id: roomName}, '-_id user_id');
			console.log(temp);

			for (var i = 0; i < temp.length; i++) {
				query.push({_id: temp[i].user_id});
			}

			temp = await user_schema.find({$or: query});
			console.log(temp);

			await socket.emit('load-members', temp, friends, admin);
		}
	});
	
	socket.on('sendchat', async function (type, message, user_id, sender_nickname) {

		console.log(type, message, user_id, sender_nickname);

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

		console.log("I'm here");
		console.log(socket.room);
		
		await io.sockets.in(socket.room).emit('updatechat', object, socket.room.split("_")[0]);
	});
	
	socket.on('sendDeleteMember', async function(member_id) {
		io.sockets.socket(users[member_id]).emit("disconnectOrder");
	});

	socket.on('changeAvatar', function (image) {
		io.sockets.in(socket.room).emit('updateAvatar', image);
	});	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		console.log("User left.");
		delete users[socket.id];
		socket.leave(socket.room);
	});
});
