var socket = io.connect("http://localhost:8080", 
{
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
	socket.emit('adduser', nickname, roomName);
});

// load history
socket.on('loadhistory', function (history) {
	$('#history').load(history);
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (data) {
	$('#conversation').append(data);
});

socket.on('updateAvatar', function (data) {
	console.log(data);
	$('.avatar').empty();
	$('.avatar').append(data);
});


// on load of page
$(function(){

	// when the client clicks SEND
	$('#send').click( function() {
		var message = '<b>'+ nickname + ':</b> ' + $('#data').val() + '<br>\n'
		$('#data').val('');
		// tell server to execute 'sendchat' and send along one parameter
		socket.emit('sendchat', message, roomName);
	});

	// when the client hits ENTER on their keyboard
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#send').focus().click();
		}
	});
});

//const upload_submit = document.querySelector("#upload");

function uploadFiles() {

	const progressBarFill = document.querySelector(".progress-bar-fill");
	const progressBarText = document.querySelector(".progress-bar-text");

	const config = {
		onUploadProgress: function(progressEvent) {
			var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
			progressBarFill.style["width"] = percentCompleted + "%";
			progressBarText.textContent = percentCompleted + "%";
		},
		headers: {
			"content-type" : "multipart/form-data",
		}
	}

	var myFile = document.querySelector(".files").files
	var formData = new FormData()
		
	for (var i = 0; i < myFile.length; i++) {
		formData.append("myFile", myFile[i])
	}

	axios.post("/send_files?chatName=" + roomName + "&nickname=" + nickname, formData, config)
	.then(function (res) {
		console.log(res)
		if (res.status == 200) {
			var message = '<b>'+ nickname + ':</b> ';
			for (var i = 0; i < myFile.length; i++) {
				if (roomName.split("_")[0] == "private") {
					message += `<img src="/main_page/uploads/privatechats/${roomName}/files/${res.data}${myFile[i].name}" width="100px" height="100px"><br>`;
				} else {
					message += `<img src="/main_page/uploads/groupchats/${roomName}/files/${res.data}${myFile[i].name}" width="100px" height="100px"><br>`;
				}
			}
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message, roomName);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};


function uploadAvatar() {

	const config = {
		headers: {
			"content-type" : "multipart/form-data",
		}
	}

	var myFile = document.querySelector(".avatar_input").files
	var formData = new FormData()
	formData.append("myFile", myFile[0])

	axios.post("/upload_group_avatar?chat_id=" + roomName, formData, config)
	.then(function (res) {
		console.log(res)
		if (res.status == 200) {
			var message = `<b>${nickname} changed group avatar</b>`;
			var image = `<img src="/main_page/uploads/groupchats/${roomName}/avatar/${myFile[0].name}" width="50px" height="50px">`;
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('changeAvatar', message, image, roomName);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};
