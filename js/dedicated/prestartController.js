'use strict';

document.addEventListener('DOMContentLoaded', function() {
    var activeGame = getCurrentGame();
    if (activeGame !== null) {
        redirectTo("game");
        return;
    }

    var db = getDatabase();
    var selectDeck = document.getElementById('selectDeck');
    var selectDiff = document.getElementById('selectDifficulty');
    var i;
    var option;

    if (selectDeck && selectDiff) {
        // Rellenar Mazos (Decks)
        for (i = 0; i < db.decks.length; i++) {
            option = document.createElement('option');
            option.value = db.decks[i].id;
            option.textContent = db.decks[i].title;
            selectDeck.appendChild(option);
        }

        // Rellenar Dificultades
        for (i = 0; i < db.difficulties.length; i++) {
            option = document.createElement('option');
            option.value = db.difficulties[i].id;
            option.textContent = db.difficulties[i].description;
            selectDiff.appendChild(option);
        }
    }

    // Guarda las preferencias iniciales
    var btnStart = document.getElementById('btnStartGame');
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            var selectedDeckId = selectDeck.value;
            var selectedDiffId = selectDiff.value;

            // Creamos una estructura inicial vacía pero válida para currentGame
            var initialGameSetup = {
                attempt: 1,
                isProgressiveMode: false,
                failuresCount: 0,
                playerName: getCurrentUsername(),
                clicks: 0,
                score: 0,
                timeInSeconds: 0,
                date: new Date().toISOString().slice(0, 10),
                deckUsed: parseInt(selectedDeckId, 10),
                difficulty: parseInt(selectedDiffId, 10),
                boardMatrix: []
            };

            saveCurrentGame(initialGameSetup);
            redirectTo("game");
        });
    }
});