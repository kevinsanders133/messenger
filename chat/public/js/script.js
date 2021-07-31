var socket = io.connect("http://localhost:8080", 
{
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});

socket.on('connect', function(){
	socket.emit('adduser', nickname, roomName);
});

socket.on('updatechat', function (messages, type) {
	let elements_to_append = "";
	messages.forEach(message => {
		if (message.type == "text") {
			console.log("text");
			if (_id == message.user_id) {
				elements_to_append += 
					`<div class="right-message-container message-container">
						${message.content}
					</div>\n`;
			} else {
				if (type == "group") {
					elements_to_append += `<img class="conversation-avatar" src="/main_page/uploads/avatars/${message.user_id}/${message.nickname}.png">`
				}
				elements_to_append += 
					`<div class="left-message-container message-container">
						${message.content}
					</div>\n`;
			}
		} else if (message.type == "image") {
			var images = message.content.split("\n");
			if (_id == message.user_id) {
				elements_to_append += `<div class="right-message-container message-container">`;
			} else {
				if (type == "group") {
					elements_to_append += `<img class="conversation-avatar" src="/main_page/uploads/avatars/${message.user_id}/${message.nickname}.png">`
				}
				elements_to_append += `<div class="left-message-container message-container">`;
			}
			for (var i = 0; i < images.length - 1; i++) {
				elements_to_append += `<img src="${images[i]}" width="30px" height="30px">\n`
			}
			elements_to_append += `</div>`;
		} else {
			var others = message.content.split("\n");
			if (_id == message.user_id) {
				elements_to_append += `<div class="right-message-container message-container">`;
			} else {
				if (type == "group") {
					elements_to_append += `<img class="conversation-avatar" src="/main_page/uploads/avatars/${message.user_id}/${message.nickname}.png">`
				}
				elements_to_append += `<div class="left-message-container message-container">`;
			}
			for (var i = 0; i < others.length - 1; i++) {
				splited_link = others[i].split("/");
				elements_to_append += `<a href="${others[i]}">${splited_link[splited_link.length - 1]} target="_blank"</a><br>\n`
			}
			elements_to_append += `</div>`;
		}
	});
	$('#conversation').append(elements_to_append);
});

socket.on('updateAvatar', function (data) {
	console.log(data);
	$('.avatar').empty();
	$('.avatar').append(data);
});

var conversation = document.getElementById("conversation");
conversation.scrollTop = conversation.scrollHeight;

$(function(){
	$('#send-message-button').click( function() {
		var message = $('#data').val();
		$('#data').val('');
		// tell server to execute 'sendchat' and send along one parameter
		socket.emit('sendchat', "text", message, _id, nickname);
	});
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#send').focus().click();
		}
	});
});

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
			let images = "";
			let others = "";
			for (var i = 0; i < myFile.length; i++) {
				console.log(myFile[i].type);
				if (roomName.split("_")[0] == "private") {
					if (/^image.*/.test(myFile[i].type)) {
						images += `/main_page/uploads/privatechats/${roomName}/files/${res.data}${myFile[i].name}\n`;
					} else {
						others += `/main_page/uploads/privatechats/${roomName}/files/${res.data}${myFile[i].name}\n`;
					}
				} else {
					if (/^image.*/.test(myFile[i].type)) {
						images += `/main_page/uploads/groupchats/${roomName}/files/${res.data}${myFile[i].name}\n`;
					} else {
						others += `/main_page/uploads/groupchats/${roomName}/files/${res.data}${myFile[i].name}\n`;
					}
				}
			}
			if (images !== "") {
				socket.emit('sendchat', "image", images, _id, nickname);
			}
			if (others !== "") {
				socket.emit('sendchat', "other", others, _id, nickname);
			}
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
			socket.emit('changeAvatar', message, image, roomName);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};
