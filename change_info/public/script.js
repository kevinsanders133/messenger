let save = document.querySelector(".save_changes");
let notification = document.querySelector("#notification");

save.addEventListener("click", e => {
    e.preventDefault();
	const target = e.target;
    let form = target.parentElement;
    let nickname = form.querySelector('input[name="nickname"]').value;
    let email = form.querySelector('input[name="email"]').value;
    let password = form.querySelector('input[name="password"]').value;
    let data = JSON.stringify({
        id: id,
        nickname: nickname,
        email: email,
        password: password
    });
    let request = new XMLHttpRequest();

    request.open("POST", "/change_info", true);   
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        notification.animate([
            { opacity: 0 },
            { opacity: 1, offset: 0.3},
            { opacity: 1, offset: 0.7},
            { opacity: 0}
        ], {
            duration: 3000,
            iterations: 1
        });
    });
    request.send(data);
});
