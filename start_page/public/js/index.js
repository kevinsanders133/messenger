const signInBtn = document.getElementById('signIn');
const signUpBtn = document.getElementById('signUp');
const fistForm = document.getElementById('form1');
const secondForm = document.getElementById('form2');
const forgotPassword = document.getElementById('forgotPassword')
const container = document.querySelector('.container');
const password = document.querySelector('input[name="password_signup"]');
const password_repeat = document.querySelector('input[name="password_check_signup"]');

function validatePassword(){
    if(password.value != password_repeat.value) {
        password_repeat.setCustomValidity("Passwords don't match");
    } else {
        password_repeat.setCustomValidity('');
    }
  }
  
password.onchange = validatePassword;
password_repeat.onkeyup = validatePassword;

signInBtn.addEventListener("click", () => {
    container.classList.remove('right-panel-active');
    if(container.classList.contains('forgot-panel-active')) {
        container.classList.remove('forgot-panel-active');
        container.classList.remove('right-panel-active');
    }
});

signUpBtn.addEventListener("click", () => {
    container.classList.add('right-panel-active');
});

forgotPassword.addEventListener("click", () => {
    container.classList.add('right-panel-active');
    container.classList.add('forgot-panel-active');
});
