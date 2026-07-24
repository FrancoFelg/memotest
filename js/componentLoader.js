'use strict';

function loadComponent(elementId, componentName) {
    var container = document.getElementById(elementId);
    var containerNotExists = !container;
    if (containerNotExists) return;

    var genericComponentsFolderName = "components";

    var isInsidePages = window.location.pathname.indexOf('/pages/') !== -1;
    var basePath = (isInsidePages ? '../' : '') + genericComponentsFolderName + '/' + componentName + '/' + componentName;

    var htmlPath = basePath + '.html';
    var cssPath = basePath + '.css';
    var jsPath = basePath + '.js';

    // CARGAR CSS
    var existingLink = document.querySelector('link[href="' + cssPath + '"]');
    if (!existingLink) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssPath;
        document.head.appendChild(link);
    }

    // CARGAR HTML
    fetch(htmlPath)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('No se pudo obtener el archivo HTML: ' + htmlPath);
            }
            return response.text();
        })
        .then(function(htmlContent) {
            container.innerHTML = htmlContent;

            // CARGAR JS (Intenta adjuntar el script del componente si existe)
            fetch(jsPath, { method: 'HEAD' })
                .then(function(jsResponse) {
                    if (jsResponse.ok) {
                        var existingScript = document.querySelector('script[src="' + jsPath + '"]');
                        if (!existingScript) {
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.src = jsPath;
                            document.body.appendChild(script);
                        }
                    }
                })
                .catch(function() {
                    // Si el componente no tiene un JS (como el footer), simplemente ignora el paso silenciosamente
                });
        })
        .catch(function(error) {
            console.error('Error en loadComponent:', error);
        });
}

//Configura los clics de los links cargados dinámicamente en el header
function setupNavigationEvents() {
    var navHome = document.getElementById('navHome');
    if (navHome) {
        navHome.addEventListener('click', function(e) {
            e.preventDefault();
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
