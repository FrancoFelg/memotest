'use strict';

initLocalStorage();
applyTheme();

//loadComponent('gencomp-header', basePath + 'header.html');
//loadComponent('gencomp-footer', basePath + 'footer.html');
loadComponent('gencomp-header', 'header');
loadComponent('gencomp-footer', 'footer');

function logout() {
    if(getCurrentGame() != null || getCurrentGame() != undefined) clearCurrentGame();
    deleteUserSession();
    redirectTo("index", "..");
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