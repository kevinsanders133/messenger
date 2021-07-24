const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server);
const fs = require('fs')

server.listen(3000);

app.use('/chat/public', express.static(__dirname + '/public'));

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }));

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = [];

// routing
app.post('/chat', function (req, res) {
	res.render('index', { roomName: req.body.chat, 
						  nickname: req.body.nickname, 
						  avatar: req.body.avatar, 
						  user_id: req.body.user_id })
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
		// echo to room history path
		socket.emit('loadhistory', "/main_page/uploads/groupchats/" + roomName + "/history/history.html");
		// echo to client they've connected
		socket.emit('updatechat', 'You have connected to ' + roomName);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(roomName).emit('updatechat', username + ' has connected to this room');
		//socket.emit('updaterooms', rooms, roomName);
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data, chat) {
		// insert data into history file
		const history = __dirname + "/groupchats/" + chat + "/history/history.html";
		fs.appendFileSync(history, data);
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', data);
	});	

	socket.on('changeAvatar', function (data, chat) {
		// insert data into history file
		const history = __dirname + "/groupchats/" + chat + "/history/history.html";
		fs.appendFileSync(history, data);
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updateAvatar', data);
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
