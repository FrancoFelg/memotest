'use strict';

initLocalStorage();

function logout(){
    deleteUserSession();
    redirectTo("index", "..");
}