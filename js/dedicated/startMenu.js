'use strict';

document.addEventListener('DOMContentLoaded', function () {

    if (typeof playMenuMusic === 'function') {
    playMenuMusic();
    }
    
    var btnPlay = document.getElementById('btnPlay');
    var btnRanking = document.getElementById('btnRanking');
    var btnConfiguration = document.getElementById('btnConfiguration');
    var btnContact = document.getElementById('btnContact');
    var btnLogout = document.getElementById('btnLogout');

    if (btnPlay) {
        btnPlay.addEventListener('click', function () {
            redirectTo("prestartGame");
        });
    }
if (btnRanking) {
    btnRanking.addEventListener('click', function () {
        console.log("Hice click en el botón Ranking");
    });
}
    if (btnConfiguration) {
        btnConfiguration.addEventListener('click', function () {
            redirectTo("configurations");
        });
    }
    if (btnContact) {
        btnContact.addEventListener('click', function () {
            redirectTo("contact");
        });
    }
    
setTimeout(function () {

    document.getElementById("navHome")?.remove();
    document.getElementById("btnLogout")?.remove();

}, 100);
});