const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');

const io = require("socket.io")({
	path: "/node1/socket.io",
	transports: ["polling", "websocket"]
});

app.use(express.json({limit: '1000mb'}));
app.use(express.urlencoded({extended: false, limit: '1000mb'}));

const server = require("http").Server(app);

io.attach(server, {
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
});

server.listen(3000);

const user_schema = require("./models/user_schema");
const user_chat_schema = require("./models/user_chat_schema");

app.set('view engine', 'ejs')
app.use('views', express.static(`${__dirname}/views`));

app.use('/main_page/uploads', express.static(`${__dirname}/uploads`));
app.use('/main_page/public', express.static(`${__dirname}/public`));

var usernames = {};

const mongoAtlasUri = process.env.MAIN_PAGE;

try {
	mongoose.connect(
		mongoAtlasUri,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		() => console.log("Mongoose is connected")
	);
} catch (e) {
	console.log("could not connect");
}
mongoose.set('useFindAndModify', false);

app.get('/main_page', async function (req, res) {
	const _id = req.query.id;
	var avatar;

	const dir = `${__dirname}/uploads/avatars/${_id}`;

	fs.readdirSync(dir).forEach(file => {
		avatar = file;
	});

	var user = await user_schema.findOne({_id: _id}, '-_id nickname tag');
	var nickname = user.nickname;
	var tag = user.tag;

	var chats = await user_chat_schema.find({ user_id: _id }, '-_id');
	var private_chats = [];
	var group_chats = [];
	var query = [];

	if (chats) {
		for (var i = 0; i < chats.length; i++) {
			if (chats[i]["chat_id"].split("_")[0] == "private") {
				private_chats.push({chat_id: chats[i]["chat_id"], chat_name: chats[i]["chat_name"]});
				query.push({chat_id: chats[i]["chat_id"]});
			} else {
				group_chats.push(chats[i]);

				console.log();

				const path = `${__dirname}/uploads/groupchats/${chats[i]["chat_id"]}/avatar`;
				fs.readdirSync(path).forEach(file => {
					group_chats[group_chats.length - 1]["avatar"] = file;
				});
			}
		}
	}

	if (query.length != 0) {
		var friends = await user_chat_schema.find({ user_id: { $ne: _id }, $or: query }, '-_id user_id');
		if (friends) {
			for (var i = 0; i < friends.length; i++) {
				const path = `${__dirname}/uploads/avatars/${friends[i]["user_id"]}`;
				fs.readdirSync(path).forEach(file => {
					private_chats[i]["avatar"] = file;
				});
				private_chats[i]["user_id"] = friends[i]["user_id"];
			}
		}
	}

	chats = private_chats.concat(group_chats);

	res.render('index', {   
		chats: chats, 
	    friends: private_chats,
		_id: _id, 
		nickname: nickname,
		tag: tag,
		avatar: avatar 
	});
});

app.post('/events', async (req, res) => {
    const content = req.body;
    console.log(content);
    if (content.collection == 'users') {
        if (content.type == 'insert') {
            const user = await new user_schema(content.data);
            await user.save();
        } else if (content.type == 'delete') {
            await user_schema.deleteOne({$and: content.data}).exec();
        } else {
            await user_schema.findOneAndUpdate({_id: content.data._id}, content.data.new_data, {upsert: true}).exec();
        }
    } else {
		if (content.type == 'insert') {
			await user_chat_schema.insertMany(content.data);
		} else {
			await user_chat_schema.deleteMany({$and: content.data});
		}
    }
    res.send(true);
});

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', function(username, roomName){
		socket.username = username;
		socket.room = roomName;
		usernames[username] = username;
		socket.join(roomName);
	});

	socket.on('sendFriendRequest', function (sender_id, nickname, avatar, chat_id, reciever_id) {
		socket.broadcast.to(reciever_id).emit('recieveFriendRequest', sender_id, nickname, avatar, chat_id);
	});	

	socket.on('sendDeleteChat', function (chat_id, members, initiator_id) {
		members.forEach(member => {
			socket.broadcast.to(member["user_id"]).emit('deleteChat', chat_id, initiator_id);
		});
	});
	
	socket.on('send-create-chat', function (recievers_ids, name, chat_id) {
		recievers_ids.forEach(reciever => {
			socket.broadcast.to(reciever).emit('create-chat', name, chat_id);
		});
	});	
	
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		console.log("User left.");
		socket.leave(socket.room);
	});
});
