var socket = io.connect("http://localhost:8080", {
							path: "/node1/socket.io",
							transports: ["polling", "websocket"]});

socket.on('connect', function(){
	socket.emit('adduser', "nickname", _id);
});

socket.on('recieveFriendRequest', function (reciever_id, reciever_nickname, avatar, chat_id) {
	console.log("recieve");
	$("#chats > ul").append(
		`
		<li> 
			<form action="/chat" method="POST">
				<input name="_id" type="hidden" value="${_id}">
				<input name="nickname" type="hidden" value="${nickname}">
				<input name="chat" type="hidden" value="${chat_id}">
				<input name="avatar" type="hidden" value="${avatar}">
				<img src="/main_page/uploads/avatars/${reciever_id}/${avatar}" width="50px" height="50px">
				<input name="user_id" type="hidden" value="${reciever_id}">
				<input type="button" value="Delete" class="deleteChat">
				<button type="submit">${reciever_nickname}</button>
			</form>
		</li>
		`
	);
	$('form[name="create-chat"]').append(
		`<input type="checkbox" name="reciever_id" value="${reciever_id}">
		<span id="${reciever_id}">${reciever_nickname}</span><br>`
	);
});

socket.on('create-chat', function (name, chat_id) {
	$("#chats > ul").append(
		`
		<li> 
			<form action="/chat" method="POST">
				<input name="_id" type="hidden" value="${_id}">
				<input name="nickname" type="hidden" value="${nickname}">
				<input name="chat" type="hidden" value="${chat_id}">
				<input name="avatar" type="hidden" value="no-avatar.png">
				<img src="/main_page/uploads/groupchats/${chat_id}/avatar/no-avatar.png" width="50px" height="50px">
				<input name="user_id" type="hidden" value="null">
				<input type="button" value="Delete" class="deleteChat">
				<button type="submit">${name}</button>
			</form>
		</li>
		`
	);
});

socket.on('deleteChat', function (chat_id, initiator_id) {
	const input = document.querySelector(`input[name="chat"][value=${chat_id}]`);
	const chat = input.parentElement.parentElement;
	chat.remove();
	if (chat_id.split("_")[0] == "private") {
		const create_chat_form = document.forms["create-chat"];
		const checkbox = create_chat_form.querySelector(`input[name="reciever_id"][value="${initiator_id}"]`);
		checkbox.remove();
		const label = create_chat_form.querySelector(`span[id="${initiator_id}"]`);
		label.remove();
	}
});

socket.on('updateAvatar', function (data) {
	console.log(data);
	$('.avatar').empty();
	$('.avatar').append(data);
});

$(function() {
	$(".avatar").empty();
    $(".avatar").append(`<img src="/main_page/uploads/avatars/${_id}/${avatar}" width="200px" height="200px">`);
});

function upload() {

	const config = {
		headers: {
			"content-type" : "multipart/form-data"
		}
	}

	var myFile = document.querySelector(".file").files
	var formData = new FormData()

	formData.append("myFile", myFile[0])

	axios.post(`/upload_avatar?_id=${_id}&nickname=${nickname}`, formData, config)
	.then(function (res) {
		console.log(res)
		if (res.status == 200) {
			const avatar = `<img src="/main_page/uploads/avatars/${_id}/${nickname}.png" width="200px" height="200px">`;
			$(".avatar").empty();
			$(".avatar").append(avatar);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};

document.querySelector(".addFriendSubmit").addEventListener("click", function (e) {
	e.preventDefault();

	let registerForm = document.forms["addFriend"];
	let reciever_nickname = registerForm.elements["reciever_nickname"].value;
	let reciever_tag = registerForm.elements["reciever_tag"].value;

	let reciever = JSON.stringify({reciever_nickname: reciever_nickname, 
									reciever_tag: reciever_tag,
									sender_id: _id,
									sender_nickname: nickname});
	let request = new XMLHttpRequest();

	request.open("POST", "/add_friend", true);   
	request.setRequestHeader("Content-Type", "application/json");
	request.addEventListener("load", function () {

		let response = JSON.parse(request.response);
		if (response.reciever_id != null) {
			$("#chats > ul").append(
				`
				<li> 
					<form action="/chat" method="POST">
						<input name="_id" type="hidden" value="${_id}">
						<input name="nickname" type="hidden" value="${nickname}">
						<input name="chat" type="hidden" value="${response.chat_id}">
						<input name="avatar" type="hidden" value="${response.avatar}">
						<img src="/main_page/uploads/avatars/${response.reciever_id}/${response.avatar}" width="50px" height="50px">
						<input name="user_id" type="hidden" value="${response.reciever_id}">
						<input type="button" value="Delete" class="deleteChat">
						<button type="submit">${reciever_nickname}</button>
					</form>
				</li>
				`
			);
			$('form[name="create-chat"]').append(
				`<input type="checkbox" name="reciever_id" value="${response.reciever_id}">
				<span id="${response.reciever_id}">${reciever_nickname}</span><br>`
			);

			socket.emit('sendFriendRequest', _id, nickname, avatar, response.chat_id, response.reciever_id);
		}
	});
	request.send(reciever);
});

document.querySelector(".create-chat-submit").addEventListener("click", function (e) {
	e.preventDefault();

	let registerForm = document.forms["create-chat"];
	let checked_checkboxes = registerForm.querySelectorAll('input[name="reciever_id"]:checked');
	let name = registerForm.elements["name"].value;
	let recievers_ids = [];

	checked_checkboxes.forEach(element => {
		recievers_ids.push(element.defaultValue);
	});

	let recievers = JSON.stringify({ recievers_ids: recievers_ids,
									sender_id: _id,
									name: name });
	let request = new XMLHttpRequest();

	request.open("POST", "/create_chat", true);   
	request.setRequestHeader("Content-Type", "application/json");
	request.addEventListener("load", function () {

		let response = JSON.parse(request.response);
		$("#chats > ul").append(
			`
			<li> 
				<form action="/chat" method="POST">
					<input name="_id" type="hidden" value="${_id}">
					<input name="nickname" type="hidden" value="${nickname}">
					<input name="chat" type="hidden" value="${response.chat_id}">
					<input name="avatar" type="hidden" value="no-avatar.png">
					<img src="/main_page/uploads/groupchats/${response.chat_id}/avatar/no-avatar.png" width="50px" height="50px">
					<input name="user_id" type="hidden" value="null">
					<input type="button" value="Delete" class="deleteChat">
					<button type="submit">${name}</button>
				</form>
			</li>
			`
		);

		socket.emit('send-create-chat', recievers_ids, name, response.chat_id);
	});
	if (recievers_ids.length != 0 && name !== "") {
		request.send(recievers);
	}
});

document.querySelector("#chats > ul").addEventListener("click", e => {
	const target = e.target;
	console.log(target);
	if (target.className == "deleteChat") {
		let form = target.parentElement;
		let chat_id_input = form.querySelector('input[name="chat"]');
		let chat_id = chat_id_input.value;
		let data = JSON.stringify({
			id: _id,
			chat_id: chat_id
		});
		let request = new XMLHttpRequest();

		request.open("POST", "/delete_chat", true);   
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function () {

			let response = JSON.parse(request.response);
			if (response) {
				form.parentElement.remove();
				if (chat_id.split("_")[0] == "private") {
					const create_chat_form = document.forms["create-chat"];
					const checkbox = create_chat_form.querySelector(`input[name="reciever_id"][value="${response.members[0]["user_id"]}"]`);
					checkbox.remove();
					const label = create_chat_form.querySelector(`span[id="${response.members[0]["user_id"]}"]`);
					label.remove();
				}
				socket.emit('sendDeleteChat', chat_id, response.members, _id);
			};

		});
		request.send(data);
	};
});

