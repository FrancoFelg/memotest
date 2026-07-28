'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // Intentar recuperar la partida recién finalizada del LocalStorage
    var lastGameStr = localStorage.getItem('last_finished_game');
    var lastGame = lastGameStr ? JSON.parse(lastGameStr) : null;
    var db = getDatabase();

    // Guardia de seguridad: Si no hay registro de juego finalizado, lo mandamos al inicio
    if (lastGame === null) {
        redirectTo("startMenu");
        return;
    }

    // Capturar elementos del DOM para las estadísticas
    var statTime = document.getElementById('statTime');
    var statScore = document.getElementById('statScore');
    var statAttempt = document.getElementById('statAttempt');
    var statMatches = document.getElementById('statMatches');
    var statFailures = document.getElementById('statFailures');
    var statUsername = document.getElementById('statUsername');
    var statDeckName = document.getElementById('statDeckName');
    var statStreak = document.getElementById('statStreak');
    var gameResultTitle = document.getElementById('gameResultTitle');
    var timeObj = calculateTimeDifference(lastGame.startDatetime,lastGame.finalDatetime);
    
    // Inyectar los datos reales acumulados
    console.log(lastGame)
    if (statTime) { statTime.textContent = timeObj.formattedTime; }
    if (statScore) { statScore.textContent = lastGame.score; }
    if (statAttempt) { statAttempt.textContent = lastGame.attempt; }
    if (statFailures) { statFailures.textContent = lastGame.failuresCount; }

    if (statUsername) { statUsername.textContent = lastGame.playerName; }
    if (statDeckName) {
        var deckName = null;
        for (var i = 0; i < db.decks.length; i++) {
            if (db.decks[i].id === lastGame.deckUsed) {
                deckName = db.decks[i].title;
                break;
            }
        }
        statDeckName.textContent = deckName;
     }
    if (statStreak) { statStreak.textContent = lastGame.actualStreak; }

    if (gameResultTitle) { 
        if(lastGame.isVictory == true) gameResultTitle.textContent = "¡Victoria!";
        else gameResultTitle.textContent = "Derrota";
     }
    
    
    // Los aciertos corresponden a la cantidad total de cartas dividido 2
    if (statMatches && lastGame.boardMatrix) {
        statMatches.textContent = lastGame.boardMatrix.length / 2;
    }

    // Capturar botones de navegación
    var btnRestart = document.getElementById('btnRestart');
    var btnConfig = document.getElementById('btnConfig');
    var btnMainMenu = document.getElementById('btnMainMenu');

    // Reiniciar partida (Mismo mazo, misma dificultad, limpia el tablero)
    if (btnRestart) {
        btnRestart.addEventListener('click', function() {
            // Creamos una nueva estructura limpia conservando la configuración paramétrica
            var newGameSetup = {
                attempt: lastGame.attempt + 1, // Sumamos un intento al historial de reintentos
                isProgressiveMode: lastGame.isProgressiveMode,
                failuresCount: 0,
                actualStreak: 0,
                playerName: lastGame.playerName,
                clicks: 0,
                score: 0,
                timeInSeconds: 0,
                date: lastGame.date,
                deckUsed: lastGame.deckUsed,
                difficulty: lastGame.difficulty,
                boardMatrix: [] // Vacío para forzar que gameController genere uno nuevo de cero
            };

            // Volvemos a activar la partida en el LocalStorage
            saveCurrentGame(newGameSetup);
            
            // Limpiamos el temporal de la pantalla final y vamos a jugar de nuevo
            localStorage.removeItem('last_finished_game');
            redirectTo("game");
        });
    }

    if (btnConfig) {
        btnConfig.addEventListener('click', function() {
            localStorage.removeItem('last_finished_game');
            redirectTo("prestartGame")
        });
    }

    if (btnMainMenu) {
        btnMainMenu.addEventListener('click', function() {
            localStorage.removeItem('last_finished_game');
            redirectTo("startMenu")
        });
    }
});
