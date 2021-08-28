const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const axios = require('axios');

const io = require("socket.io")({
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});

const mongoAtlasUri = process.env.CHAT;

try {
	mongoose.connect(
		mongoAtlasUri,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		() => console.log("Mongoose is connected")
	);
} catch (e) {
	console.log("could not connect");
}

const user_schema = require("./models/user_schema");
const user_chat_schema = require("./models/user_chat_schema");

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

app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({ extended: false }));

var users = {};

app.post('/chat', function (req, res) {
	res.render('index', { 
		roomName: req.body.chat,
		chat_name: req.body.chat_name,
		nickname: req.body.nickname,
		_id: req.body._id, 
		avatar: req.body.avatar, 
		user_id: req.body.user_id,
		tag: req.body.tag
	});
});

app.post('/events', async (req, res) => {
    const content = req.body;
	console.log("events");
    console.log(content + "   /events");
    if (content.collection == 'users') {
        if (content.type == 'insert') {
            const user = await new user_schema(content.data);
            await user.save();
        } else if (content.type == 'delete') {
            await user_schema.deleteOne({$and: content.data}).exec();
        } else {
            await user_schema.findOneAndUpdate({_id: content.data._id}, content.data.new_data, {upsert: true}).exec();
        }
    } else if (content.collection == 'user_chat') {
		if (content.type == 'insert') {
			await user_chat_schema.insertMany(content.data);
		} else if (content.type == 'delete') {
			await user_chat_schema.deleteMany({$and: content.data});

			if (content.data.length == 1) {
				var collections = await mongoose.connection.db.listCollections().toArray();
				for (i = 0; i < collections.length; i++) {
					console.log(collections[i].name);
					if (collections[i].name == content.data[0].chat_id) {
						await mongoose.connection.db.dropCollection(content.data[0].chat_id);
						break;
					}
				}
			}

		} else {
			
		}
    } else {
		let chat_schema = mongoose.model(content.collection, schema, content.collection);
		
		let record = await new chat_schema(content.data);

		await record.save();
	}
	console.log("end");
    res.send(true);
});

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', async function(username, roomName, id){
		
		socket.room = roomName;
		users[id] = socket.id;
		console.log(roomName);

		await socket.join(roomName);

		let chat_schema = mongoose.model(roomName, schema, roomName);

		var doc = await chat_schema.find({});
		await socket.emit('updatechat', doc, roomName.split("_")[0]);

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
	
	socket.on('sendchat', async function (object) {
		console.log("sendchat");
		console.log(object);
		await io.sockets.in(socket.room).emit('updatechat', object, socket.room.split("_")[0]);
	});
	
	socket.on('sendDeleteMember', async function(member) {
		console.log("sendDeleteMember");
		//await io.to(users[member.id]).emit("disconnectOrder");
		await io.sockets.in(socket.room).emit("removeMember", member);
	});

	socket.on('sendAddMembers', async function(members) {
		console.log("sendAddMembers");
		await io.sockets.in(socket.room).emit("addMembers", members);
	});

	socket.on('changeAvatar', function (image) {
		io.sockets.in(socket.room).emit('updateAvatar', image);
	});	

	socket.on('disconnect', function(){
		console.log("User left.");
		delete users[socket.id];
		socket.leave(socket.room);
	});
});
