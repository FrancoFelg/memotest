"use strict";

document.addEventListener("DOMContentLoaded", function () {

    var contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", validarFormularioContacto);
    }

});

function validarFormularioContacto(event) {

    event.preventDefault();

    limpiarErrores();

    var nombre = document.getElementById("contactName").value.trim();
    var mail = document.getElementById("contactEmail").value.trim();
    var mensaje = document.getElementById("contactMessage").value.trim();

    var formularioValido = true;

    var regexNombre = /^[a-zA-Z0-9 ]+$/;
    var regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nombre.length < 3) {

        mostrarError("errorName", "El nombre debe tener al menos 3 caracteres.");
        formularioValido = false;

    } else if (!regexNombre.test(nombre)) {

        mostrarError("errorName", "El nombre solo puede contener letras, números y espacios.");
        formularioValido = false;

    }

    if (!regexMail.test(mail)) {

        mostrarError("errorEmail", "Ingrese un correo electrónico válido.");
        formularioValido = false;

    }

    if (mensaje.length <= 5) {

        mostrarError("errorMessage", "El mensaje debe tener más de 5 caracteres.");
        formularioValido = false;

    }

    if (!formularioValido) {
        return;
    }

    enviarMail(nombre, mail, mensaje);

}

function mostrarError(idElemento, mensaje) {

    document.getElementById(idElemento).textContent = mensaje;

}

function limpiarErrores() {

    document.getElementById("errorName").textContent = "";
    document.getElementById("errorEmail").textContent = "";
    document.getElementById("errorMessage").textContent = "";

}

function enviarMail(nombre, mail, mensaje) {

    var destinatario = "soporte@memotest.com";

    var asunto = "Consulta desde Memotest";

    var cuerpo =
        "Nombre: " + nombre + "\n" +
        "Mail: " + mail + "\n\n" +
        "Mensaje:\n" +
        mensaje;

    window.location.href =
        "mailto:" + destinatario +
        "?subject=" + encodeURIComponent(asunto) +
        "&body=" + encodeURIComponent(cuerpo);

}