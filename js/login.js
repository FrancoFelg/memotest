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

document.addEventListener('DOMContentLoaded', function() {
    var btnLogin = document.getElementById('loginButton');
    
    if (btnLogin) {
        btnLogin.addEventListener('click', validarIngresoUsuario);
    }
});