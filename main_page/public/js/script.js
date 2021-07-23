$(function() {
	$(".avatar").empty();
    $(".avatar").append('<img src="/main_page/uploads/avatars/' + _id + '/' + avatar + '" width="200px" height="200px">');
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

	axios.post("/upload_avatar?_id=" + _id, formData, config)
	.then(function (res) {
		console.log(res)
		if (res.status == 200) {
			const avatar = '<img src="/main_page/uploads/avatars/' + _id + '/' + myFile[0].name + '" width="200px" height="200px">';
			$(".avatar").empty();
			$(".avatar").append(avatar);
		}
	})
	.catch(function (err) {
		console.log(err)
	})
};
