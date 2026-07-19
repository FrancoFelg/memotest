'use strict';

document.addEventListener('DOMContentLoaded', function() {
    var btnPlay = document.getElementById('btnPlay');
    var btnRanking = document.getElementById('btnRanking');
    var btnConfiguration = document.getElementById('btnConfiguration');
    var btnContact = document.getElementById('btnContact');

    if (btnPlay) {
        btnPlay.addEventListener('click', function() {
            window.location.href = 'prestartGame.html';
        });
    }
    if (btnRanking) {
        btnRanking.addEventListener('click', function() {
            window.location.href = 'rankings.html';
        });
    }
    if (btnConfiguration) {
        btnConfiguration.addEventListener('click', function() {
            window.location.href = 'configurations.html';
        });
    }
    if (btnContact) {
        btnContact.addEventListener('click', function() {
            window.location.href = 'contact.html';
        });
    }
});