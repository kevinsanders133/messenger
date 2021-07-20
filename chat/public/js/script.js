var socket = io();

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

function upload() {

	const progressBarFill = document.querySelector(".progress-bar-fill");
	const progressBarText = document.querySelector(".progress-bar-text");

	const config = {
		onUploadProgress: function(progressEvent) {
			var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
			progressBarFill.style["width"] = percentCompleted + "%";
			progressBarText.textContent = percentCompleted + "%";
		},
		headers: {
			"content-type" : "multipart/form-data"
		}
	}

	var myFile = document.querySelector(".files").files
	console.log(myFile)
	var formData = new FormData()
	var names = [];
	var milis = [];
		
	for (var i = 0; i < myFile.length; i++) {
		names.push(myFile[i].name);
		milis.push(Date.now());
		myFile[i].name = milis[i] + myFile[i].name;
		formData.append("myFile", myFile[i])
	}

	axios.post("/send_files?chatName=" + roomName + "&nickname=" + nickname, formData, config)
	.then(function (res) {
		console.log(res)
		if (res.status == 200) {
			var message = '<b>'+ nickname + ':</b> ';
			for (var i = 0; i < myFile.length; i++) {
				message += '<a href="/chat/histories/' + roomName + '/files/' + 
				myFile[i].name + '" download="' + names[i] + '">' + names[i] + '</a><br>';
			}
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message, roomName);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};
