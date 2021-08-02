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
			if (_id == message.user_id) {
				elements_to_append += 
					`<div class="right-message-container message-container">
						${message.content}
					</div>\n`;
			} else {
				if (type == "group") {
					elements_to_append += 
					`<div class="left-groupchat-message-container">\n
					<img class="conversation-avatar" src="/main_page/uploads/avatars/${message.user_id}/${message.nickname}.png">`
				}
				elements_to_append += 
					`<div class="left-message-container message-container">
						${message.content}
					</div>\n</div>`;
			}
		} else if (message.type == "image") {
			var images = message.content.split("\n");
			let images_container = "";
			if (_id == message.user_id) {
				elements_to_append += `<div class="right-image-container image-container">`;
			} else {
				if (type == "group") {
					elements_to_append += 
					`<div class="left-groupchat-message-container">\n
					<img class="conversation-avatar" src="/main_page/uploads/avatars/${message.user_id}/${message.nickname}.png">`
				}
				elements_to_append += `<div class="left-image-container image-container">`;
			}
			for (var i = 0; i < images.length - 1; i++) {
				elements_to_append += `<img src="${images[i]}" class="uploaded-image">\n`;
				images_container += `<img src="${images[i]}" class="images-container-image">\n`;
			}
			elements_to_append += `</div>\n</div>`;
			$("#images-container").append(images_container);
		} else {
			var others = message.content.split("\n");
			let files_container = "";
			if (_id == message.user_id) {
				elements_to_append += `<div class="right-message-container message-container">`;
			} else {
				if (type == "group") {
					elements_to_append += 
					`<div class="left-groupchat-message-container">\n
					<img class="conversation-avatar" src="/main_page/uploads/avatars/${message.user_id}/${message.nickname}.png">`
				}
				elements_to_append += `<div class="left-message-container message-container">`;
			}
			for (var i = 0; i < others.length - 1; i++) {
				splited_link = others[i].split("/");
				elements_to_append += `<a href="${others[i]}" target="_blank">${splited_link[splited_link.length - 1]}</a><br>\n`;
				files_container += `<a href="${others[i]}" target="_blank" class="files-container-file" download>${splited_link[splited_link.length - 1]}</a>\n`;
			}
			elements_to_append += `</div>\n</div>`;
			$("#files-container").append(files_container);
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

let overlay = document.querySelector(".overlay");
let files_input = document.querySelector(".files");
let close = document.querySelector(".close");
let data = document.querySelector("#data");
let send_message_button = document.querySelector("#send-message-button");
let menu_images = document.querySelector("#menu-images");
let menu_files = document.querySelector("#menu-files");
let images_container = document.querySelector("#images-container");
let files_container = document.querySelector("#files-container");

window.onload = function() {
    files_container.style["display"] = "none";
};

files_input.addEventListener("change", () => {
    overlay.style["visibility"] = "visible";
    overlay.style["opacity"] = "1";
});
close.addEventListener("click", () => {
    overlay.style.removeProperty("visibility");
    overlay.style.removeProperty("opacity");
    files_input.value = "";
});

data.addEventListener("keyup", checkIfEmpty);
data.addEventListener("click", checkIfEmpty);
function checkIfEmpty() {
    if (data.value != "") {
        send_message_button.style["display"] = "block";
    } else {
        send_message_button.style.removeProperty("display");
    } 
}

menu_images.addEventListener("click", () => {
    images_container.style["display"] = "flex";
    files_container.style["display"] = "none";
});

menu_files.addEventListener("click", () => {
    images_container.style["display"] = "none";
    files_container.style["display"] = "flex";
});

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
