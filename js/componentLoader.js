'use strict';
console.log("componentLoader")

function loadComponent(elementId, componentPath) {
    var container = document.getElementById(elementId);
    var containerNotExists = !container
    if (containerNotExists) return;

    fetch(componentPath)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('No se pudo cargar el componente: ' + componentPath);
            }
            return response.text();
        })
        .then(function(html) {
            container.innerHTML = html;
            setupNavigationEvents();
        })
        .catch(function(error) {
            console.error(error);
        });
}

//Configura los clics de los links cargados dinámicamente en el header
function setupNavigationEvents() {
    var navHome = document.getElementById('navHome');
    if (navHome) {
        navHome.addEventListener('click', function(e) {
            e.preventDefault();
            // Determinar si estamos en pages/ o en la raíz para redirigir
            var isInsidePages = window.location.pathname.indexOf('/pages/') !== -1;
            if (isInsidePages) {
                redirectTo('index', '..');
            } else {
                redirectTo('index');
            }
        });
    }
}

// Detectamos la ubicación actual para ajustar la ruta de búsqueda del componente
var isInsidePagesFolder = window.location.pathname.indexOf('/pages/') !== -1;
var basePath = isInsidePagesFolder ? '../components/' : 'components/';
