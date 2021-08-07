var socket = io.connect("http://localhost:8080", 
{
	path: "/node2/socket.io",
	transports: ["polling", "websocket"]
});

socket.on('connect', function(){
	socket.emit('adduser', nickname, roomName, _id);
});

let overlay_1 = document.querySelector("#popup1");
let files_input = document.querySelector(".files");
let close_1 = document.querySelector(".close1");
let data = document.querySelector("#data");
let send_message_button = document.querySelector("#send-message-button");
let menu_images = document.querySelector("#menu-images");
let menu_files = document.querySelector("#menu-files");
let images_container = document.querySelector("#images-container");
let files_container = document.querySelector("#files-container");

let overlay_2;
let close_2;
let menu_members;
let members_container;
let add_member_image;

let conversation = document.getElementById("conversation");
conversation.scrollTop = conversation.scrollHeight;

files_input.addEventListener("change", () => {
    overlay_1.style["visibility"] = "visible";
    overlay_1.style["opacity"] = "1";
});

close_1.addEventListener("click", () => {
    overlay_1.style.removeProperty("visibility");
    overlay_1.style.removeProperty("opacity");
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

socket.on('load-members', function(members, friends, admin) {
	console.log(members);
	console.log(friends);

	overlay_2 = document.querySelector("#popup2");
	close_2 = document.querySelector(".close2");
	menu_members = document.querySelector("#menu-members");
	members_container = document.querySelector("#members-container");
	add_member_image = document.querySelector("#add-member-image");

	add_member_image.addEventListener("click", () => {
		overlay_2.style["visibility"] = "visible";
		overlay_2.style["opacity"] = "1";
	});

	close_2.addEventListener("click", () => {
		overlay_2.style.removeProperty("visibility");
		overlay_2.style.removeProperty("opacity");
	});

	menu_members.addEventListener("click", () => {
		images_container.style["display"] = "none";
		files_container.style["display"] = "none";
		members_container.style["display"] = "flex";
	});

	menu_images.addEventListener("click", () => {
		images_container.style["display"] = "flex";
		files_container.style["display"] = "none";
		members_container.style["display"] = "none";
	});
	
	menu_files.addEventListener("click", () => {
		images_container.style["display"] = "none";
		files_container.style["display"] = "flex";
		members_container.style["display"] = "none";
	});

	$(".menu").append(`<span id="menu-members" class="menu-item">Members</span>`);

	$("aside").append(`
	<div id="members-container">
		<img src="/chat/public/img/add_member.png" id="add-member-image">
	</div>`);

	$("footer").append(`
	<div id="popup2" class="overlay">
		<div class="overlay-container">
			<h2>Add friends</h2>
			<a class="close2" href="#">&times;</a>
			<div class="content">
			<form action="/change_members" method="POST" id="change-members">
				<input type="submit" value="Add">
			</form>
			</div>
		</div>
	</div>`);

	if (admin == true) {
		$("#members-container").append(`<img src="/chat/public/img/add_member.png" id="add-member-image"></img>`);
		friends.forEach(friend => {
			$("#change-members").prepend(`
			<div class="friend-checkbox">
				<input type="checkbox" name="user_id" value="${friend._id}">
				<span class="friend">Friend</span>
			</div>`);
		});
	}

	friends.forEach(friend => {
		$("#members-container").append(`
		<form action="/change_members" method="POST" class="member">
			<img class="members-container-image" src="/main_page/uploads/avatars/${friend._id}/${friend.nickname}.png">
			<span>${friend._id}${friend.tag}</span>
			<input class="delete-member" type="submit" value="Delete">
		</form>`);
	});
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
					`<div class="sender-nickname">${message.nickname}</div>
					<div class="left-groupchat-message-container">\n
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
					`<div class="sender-nickname">${message.nickname}</div>
					<div class="left-groupchat-message-container">\n
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
					`<div class="sender-nickname">${message.nickname}</div>
					<div class="left-groupchat-message-container">\n
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

socket.on('');

socket.on('updateAvatar', function (data) {
	console.log(data);
	$('#avatar').remove();
	$('#chat-info-container').prepend(data);
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
			var name = `/main_page/uploads/groupchats/${roomName}/avatar/${roomName}.png?date=${(+new Date())}`;
			var image = `<img id="avatar" src="${name}">`;
			socket.emit('changeAvatar', image);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};
