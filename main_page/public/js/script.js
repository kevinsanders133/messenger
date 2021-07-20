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
