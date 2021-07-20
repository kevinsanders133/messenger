const signInBtn = document.getElementById('signIn');
const signUpBtn = document.getElementById('signUp');
const fistForm = document.getElementById('form1');
const secondForm = document.getElementById('form2');
const forgotPassword = document.getElementById('forgotPassword')
const container = document.querySelector('.container');


signInBtn.addEventListener("click", () => {
    container.classList.remove('right-panel-active');
    if(container.classList.contains('forgot-panel-active')) {
        container.classList.remove('forgot-panel-active');
        container.classList.add('right-panel-active');
    }
});

signUpBtn.addEventListener("click", () => {
    container.classList.add('right-panel-active');
});

forgotPassword.addEventListener("click", () => {
    container.classList.add('forgot-panel-active');
    /**container.classList.remove('container');
    container.classList.add('container--forgot');**/
});

fistForm.addEventListener("submit", (e) => e.preventDefault());
secondForm.addEventListener("submit", (e) => e.preventDefault());