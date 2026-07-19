'use strict';

document.addEventListener('DOMContentLoaded', function() {
    var activeGame = getCurrentGame();
    
    var noActiveGame = activeGame === null;
    if (noActiveGame) {
        window.location.href = 'prestartGame.html';
        return; 
    }

    
});