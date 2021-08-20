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
let leave_chat = document.querySelector(".leave-chat");

window.onload = () => {
	files_container.style["display"] = "none";
}

let overlay_2;
let close_2;
let menu_members;
let members_container;
let add_member_image;
let isAdmin = false;

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
	console.log(admin);
	console.log(members);
	console.log(friends);

	overlay_2 = document.querySelector("#popup2");
	close_2 = document.querySelector(".close2");
	menu_members = document.querySelector("#menu-members");
	members_container = document.querySelector("#members-container");

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

	if (admin.admin == true) {
		isAdmin = true;
		let members_ids = members.map(member => {return member._id});
		$("#members-container").append(`<img src="/chat/public/img/add_member.png" id="add-member-image"></img>`);
		friends.forEach(friend => {
			if (!members_ids.includes(friend._id)) {
				$("#change-members").prepend(`
				<div class="friend-checkbox">
					<input type="checkbox" name="user_id" value="${friend._id}">
					<input type="hidden" name="user_nickname" value="${friend.nickname}">
					<input type="hidden" name="user_tag" value="${friend.tag}">
					<span class="friend">${friend.nickname}${friend.tag}</span>
				</div>`);
			}
		});
		add_member_image = document.querySelector("#add-member-image");
		add_member_image.addEventListener("click", () => {
			overlay_2.style["visibility"] = "visible";
			overlay_2.style["opacity"] = "1";
		});
	}

	members.forEach(member => {
		var member_string = ""
		member_string += `
		<div class="member">
			<input type="hidden" name="id" value="${member._id}">
			<input type="hidden" name="nickname" value="${member.nickname}">
			<input type="hidden" name="tag" value="${member.tag}">
			<img class="members-container-image" src="/main_page/uploads/avatars/${member._id}/${member.nickname}.png">
			<span>${member.nickname}${member.tag}</span>`;
		if (admin.admin == true && member._id != _id) {
			member_string += `
			<input class="delete-member" type="submit" value="Delete" onclick="deleteMember(event)">`;
		}
		member_string += `</div>`;
		$("#members-container").append(member_string);
	});
});

socket.on("removeMember", member => {
	console.log(member);
	if (member.id == _id) {
		window.location.replace(`/main_page?id=${_id}`);
	} else {
		$(`#members-container input[name="id"][value="${member.id}"]`).parent().remove();
		if (isAdmin == true) {
			$("#change-members").prepend(`
				<div class="friend-checkbox">
					<input type="checkbox" name="user_id" value="${member.id}">
					<input type="hidden" name="user_nickname" value="${member.nickname}">
					<input type="hidden" name="user_tag" value="${member.tag}">
					<span class="friend">${member.nickname}${member.tag}</span>
				</div>`);
		}
	}
});

function deleteMember(e) {
	e.preventDefault();
	const target = e.target;
	console.log(target);
	let form = target.parentElement;
	let member_id = form.querySelector('input[name="id"]').value;
	let member_nickname = form.querySelector('input[name="nickname"]').value;
	let member_tag = form.querySelector('input[name="tag"]').value;
	let data = JSON.stringify({
		member: member_id,
		chat_id: roomName
	});
	let request = new XMLHttpRequest();

	request.open("POST", "/change_members_delete", true);   
	request.setRequestHeader("Content-Type", "application/json");
	request.addEventListener("load", function () {

		let response = JSON.parse(request.response);
		if (response) {
			$(`#change-members input[name="user_id"][value="${member_id}"]`).parent().remove();
			socket.emit('sendDeleteMember', {id: member_id, nickname: member_nickname, tag: member_tag});
		};

	});
	request.send(data);
}

socket.on("addMembers", members => {
	console.log(members);
	members.forEach(member => {
		var member_string = ""
		member_string += `
		<div class="member">
			<input type="hidden" name="id" value="${member.id}">
			<img class="members-container-image" src="/main_page/uploads/avatars/${member.id}/${member.nickname}.png">
			<span>${member.nickname}${member.tag}</span>`;
		if (isAdmin == true) {
			member_string += `
			<input class="delete-member" type="submit" value="Delete" onclick="deleteMember(event)">`;
			document.querySelector(`#change-members input[name="user_id"][value="${member.id}"]`).parentElement.remove();
		}
		member_string += `</div>`;
		$("#members-container").append(member_string);
	});
});

function addMembers(e) {
	e.preventDefault();
	const target = e.target;
	console.log(target);
	let form = target.parentElement;
	let users_ids = form.querySelectorAll('input[name="user_id"]');
	let users_nicknames = form.querySelectorAll('input[name="user_nickname"]');
	let users_tags = form.querySelectorAll('input[name="user_tag"]');
	let members = [];
	for (var i = 0; i < users_ids.length; i++) {
		if (users_ids[i].checked) {
			members.push({id: users_ids[i].value, nickname: users_nicknames[i].value, tag: users_tags[i].value});
		}
    }
	if (members.length != 0) {
		let data = JSON.stringify({
			members: members,
			chat_id: roomName,
			chat_name: chat_name
		});
		let request = new XMLHttpRequest();
	
		request.open("POST", "/change_members_add", true); 
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function () {
	
			let response = JSON.parse(request.response);
			if (response) {
				socket.emit('sendAddMembers', members);
			};
	
		});
		request.send(data);
	}
}

socket.on('disconnectOrder', function() {
	console.log("disconnect order");
	window.location.replace(`/main_page?id=${_id}`);
});

socket.on('updatechat', function (messages, type) {
	console.log(messages + " - " + type);
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
				images_container += `<a href="${images[i]}" target="_blank" download><img src="${images[i]}" class="images-container-image"></a>\n`;
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



socket.on('updateAvatar', function (data) {
	console.log(data);
	$('#avatar').remove();
	$('#chat-info-container').prepend(data);
});

$(function(){
	$('#send-message-button').click( async function() {
		var message = $('#data').val();
		$('#data').val('');

		var object = await axios.post('/send_message', {
			service: "chat", 
			collection: roomName, 
			type: "insert", 
			data: {
				type: "text",
				message: message,
				user_id: _id,
				sender_nickname: nickname
			}
		});

		console.log(object.data);

		await socket.emit('sendchat', object.data);
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

	var myFile = document.querySelector(".files").files;
	var formData = new FormData();
		
	for (var i = 0; i < myFile.length; i++) {
		formData.append("myFile", myFile[i]);
	}

	axios.post(`/send_files?chat_name=${roomName}`, formData, config)
	.then(async res => {
		console.log(res);
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

			var messages = [];
			if (images !== "") {
				messages.push({
					type: "image",
					content: images,
					user_id: _id,
					nickname: nickname
				});
			}
			if (others !== "") {
				messages.push({
					type: "other",
					content: others,
					user_id: _id,
					nickname: nickname
				});
			}
			await axios.post('/send_files_info', {
				service: "chat", 
				collection: roomName, 
				type: "insert", 
				data: messages
			});
			await socket.emit('sendchat', messages);
		}
	})
	.catch(function (err) {
		console.log(err)
	});
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

if (leave_chat != null) {
	leave_chat.addEventListener('click', async (e) => {
		e.preventDefault();
	
		await axios.post('/change_members_delete', {
			member: _id,
			chat_id: roomName
		});
	
		await socket.emit('sendDeleteMember', {id: _id, nickname: nickname, tag: tag});
	});
}
