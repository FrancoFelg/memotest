'use strict';
initLocalStorage();

//loadComponent('gencomp-header', basePath + 'header.html');
//loadComponent('gencomp-footer', basePath + 'footer.html');
loadComponent('gencomp-header', 'header');
loadComponent('gencomp-footer', 'footer');

function logout(){
    deleteUserSession();
    redirectTo("index", "..");
}