function validarIngresoUsuario() {
    var inputUser = document.getElementById('nombreUsuario');
    var username = inputUser .value.trim();
    var regexAlfanumerico = /^[a-zA-Z0-9]+$/;

    if (username.length < 3) {
        mostrarErrorLogin('El nombre de usuario debe tener al menos 3 caracteres.');
        return;
    }

    if (!regexAlfanumerico.test(username)) {
        mostrarErrorLogin('El nombre de usuario solo puede contener letras y números.');
        return;
    }

    setCurrentUsername(username);
    redirectTo("startMenu", "pages");
}

function mostrarErrorLogin(mensaje) {
    var form = document.getElementById('loginForm');
    var errorDiv = document.getElementById('login-error-message');

    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'login-error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        form.appendChild(errorDiv);
    }

    errorDiv.textContent = mensaje;
}

function applyTheme() {

    var theme = getSystemTheme();

    document.body.classList.remove("light-theme");
    document.body.classList.remove("dark-theme");

    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.add("light-theme");
    }

}


document.addEventListener("DOMContentLoaded", function () {

    loadComponent("gencomp-header", "header");
    loadComponent("gencomp-footer", "footer");

    applyTheme();

    var btnLogin = document.getElementById("loginButton");

    if (btnLogin) {
        btnLogin.addEventListener("click", validarIngresoUsuario);
    }

});


document.addEventListener("DOMContentLoaded", function () {

    loadComponent("gencomp-header", "header");
    loadComponent("gencomp-footer", "footer");

    applyTheme();

    var btnLogin = document.getElementById("loginButton");

    if (btnLogin) {
        btnLogin.addEventListener("click", validarIngresoUsuario);
    }

    setTimeout(function () {

        document.getElementById("navHome")?.remove();
        document.getElementById("btnLogout")?.remove();

    }, 100);

});