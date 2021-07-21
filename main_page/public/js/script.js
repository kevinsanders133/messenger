function upload() {

	const config = {
		headers: {
			"content-type" : "multipart/form-data"
		}
	}

	var myFile = document.querySelector(".file").files
	const name = myFile.name;
	console.log(myFile)
	var formData = new FormData()

	formData.append("myFile", myFile)

	axios.post("/upload_avatar?_id=" + _id, formData, config)
	.then(function (res) {
		console.log(res)
		if (res.status == 200) {
			const avatar = '<img src="/uploads/avatars/' + _id + '/' + name + '">';
			$(".avatar").append(avatar);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};
