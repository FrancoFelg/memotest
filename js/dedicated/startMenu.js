'use strict';

document.addEventListener('DOMContentLoaded', function() {
    var btnPlay = document.getElementById('btnPlay');
    var btnRanking = document.getElementById('btnRanking');
    var btnConfiguration = document.getElementById('btnConfiguration');
    var btnContact = document.getElementById('btnContact');

    if (btnPlay) {
        btnPlay.addEventListener('click', function() {
            redirectTo("prestartGame");
        });
    }
    if (btnRanking) {
        btnRanking.addEventListener('click', function() {
            redirectTo("rankings");
        });
    }
    if (btnConfiguration) {
        btnConfiguration.addEventListener('click', function() {
            redirectTo("configurations");
        });
    }
    if (btnContact) {
        btnContact.addEventListener('click', function() {
            redirectTo("contact");
        });
    }
});