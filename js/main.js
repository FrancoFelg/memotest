'use strict';
console.log("main")

initLocalStorage();

loadComponent('gencomp-header', basePath + 'header.html');
loadComponent('gencomp-footer', basePath + 'footer.html');

function logout(){
    deleteUserSession();
    redirectTo("index", "..");
}