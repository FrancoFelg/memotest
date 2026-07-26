'use strict';

document.addEventListener('DOMContentLoaded', function () {
    var activeGame = getCurrentGame();
    console.log(activeGame)
    var noActiveGame = activeGame === null;
    var isProgressiveMode = activeGame.isProgressiveMode;
    var gameTimerInterval = null;
    var gameScore = 0;

    if (noActiveGame) {
        redirectTo("prestartGame")
        return;
    }

    // Variables de control del juego en memoria global del script
    var db = getDatabase();

    var deckNameText = document.getElementById('deckNameText');
    var deckName = "";
    var timerText = document.getElementById('timerText');
    var errorsCount = document.getElementById('errorsCountText');
    var streak = document.getElementById('streakText');
    var retryCount = document.getElementById('retryCountText');
    var i = 0;

    errorsCount.innerText = activeGame.failuresCount;
    streak.innerText = activeGame.actualStreak;
    retryCount.innerText = activeGame.attempt;

    //Settear el nombre de la baraja actual
    if (db && db.decks && activeGame.deckUsed) {
        deckName = getActualDeckName();
        deckNameText.textContent = deckName;
    }

    var currentDiff = null;
    var currentDeck = null;
    var cardsFlipped = []; // Arreglo de control de turnos (máximo 2 posiciones)
    var lockBoard = false;  // Bandera para bloquear clics en transiciones de error
    var i;

    // Buscar la dificultad y el mazo correspondientes en la BBDD local
    for (i = 0; i < db.difficulties.length; i++) {
        if (db.difficulties[i].id === activeGame.difficulty) {
            currentDiff = db.difficulties[i];
            break;
        }
    }
    for (i = 0; i < db.decks.length; i++) {
        if (db.decks[i].id === activeGame.deckUsed) {
            currentDeck = db.decks[i];
            break;
        }
    }

    if (typeof activeGame.remainingTime !== 'number') {
        activeGame.remainingTime = 300;
    }

    var scoreElement = document.getElementById('scoreElement');

    // Iniciar el temporizador descendente
    startCountdownTimer(activeGame, timerText, scoreElement);

    // Sección TEMPORIZADOR
    if (typeof activeGame.remainingTime !== 'number') {
        activeGame.remainingTime = 300;
    }

    function startCountdownTimer(activeGame, timerElement, scoreElement) {
        updateTimerDisplay(activeGame.remainingTime, timerElement);
        //Limpiar para evitar duplicaciones
        if (gameTimerInterval) clearInterval(gameTimerInterval);

        gameTimerInterval = setInterval(function () {
            updateEachSecond(timerElement, scoreElement);
        }, 1000);
    }

    function updateEachSecond(timerElement, scoreElement) {
        //* Actualizar Temporizador
        activeGame.remainingTime--;
        activeGame.timeInSeconds = (activeGame.timeInSeconds || 0) + 1; // Tiempo transcurrido acumulado

        saveCurrentGame(activeGame);
        updateTimerDisplay(activeGame.remainingTime, timerElement);

        // Al llegar a cero, detener el reloj y finalizar partida
        var noTimeRemaining = activeGame.remainingTime <= 0;
        if (noTimeRemaining) {
            clearInterval(gameTimerInterval);
            checkEndGame();
        }
        //* Actualizar Temporizador
        if (activeGame.score > 0) activeGame.score -= currentDiff.configurations.penalizationPerSecond;

        scoreElement.innerText = activeGame.score;
        errorsCount.innerText = activeGame.failuresCount;
        streak.innerText = activeGame.actualStreak;
        retryCount.innerText = activeGame.attempt;
    }

    function updateTimerDisplay(secondsTotal, element) {
        if (!element) return;
        var minutes = Math.floor(secondsTotal / 60);
        var seconds = secondsTotal % 60;
        var formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
        var formattedSeconds = seconds < 10 ? '0' + seconds : seconds.toString();
        element.textContent = formattedMinutes + ':' + formattedSeconds;
    }
    // Sección TEMPORIZADOR

    // Sección BARAJAS/SELECCIONAR CARTAS
    function shuffle(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    function selectCard(event) {
        var clickedCardSlot = event.currentTarget;
        var selectedEvtCard = clickedCardSlot.cardData;

        // Restricciones: Ignorar si el tablero está bloqueado, si ya matcheó o si se clickea la misma carta
        if (lockBoard || selectedEvtCard.isMatched || clickedCardSlot.classList.contains('revealed')) {
            return;
        }

        activeGame.clicks += 1;
        clickedCardSlot.classList.add('revealed');

        // Lógica de llenado del arreglo de control de 2 posiciones
        if (cardsFlipped.length === 0) {
            cardsFlipped.push({ element: clickedCardSlot, data: selectedEvtCard });
        } else if (cardsFlipped.length === 1) {
            cardsFlipped.push({ element: clickedCardSlot, data: selectedEvtCard });

            // Bloqueamos clics entrantes para procesar el resultado de la comparación
            lockBoard = true;

            if (cardsFlipped[0].data.img === cardsFlipped[1].data.img) {

                // Coincidencia exitosa
                cardsFlipped[0].data.isMatched = true;
                cardsFlipped[1].data.isMatched = true;

                activeGame.score += currentDiff.configurations.pointsOnCorrect;
                activeGame.score *= 1 + currentDiff.configurations.multiplierOnCombo * activeGame.actualStreak;
                activeGame.actualStreak += 1;

                cardsFlipped = [];
                lockBoard = false;

                saveCurrentGame(activeGame);
                checkEndGame();
            } else {
                // Caso Fallido: No coinciden
                activeGame.failuresCount += 1;
                activeGame.actualStreak = 0;
                activeGame.score -= currentDiff.configurations.pointsOnError;

                if (activeGame.score < 0) {
                    activeGame.score = 0;
                }

                saveCurrentGame(activeGame);

                // Mostrar el error por 1 segundo, luego ocultar las dos tarjetas erróneas
                setTimeout(function () {
                    cardsFlipped[0].element.classList.remove('revealed');
                    cardsFlipped[1].element.classList.remove('revealed');

                    cardsFlipped = [];
                    lockBoard = false;
                }, 1000);
            }
        }
    }
    // Sección BARAJAS/SELECCIONAR CARTAS

    //Seccion PARTIDA
    function generateAndStartGame() {
        var tableBoard = document.getElementById('tableBoard');
        var scoreElement = document.getElementById('scoreElement');
        scoreElement.innerText = gameScore;
        var totalCards = currentDiff.configurations.amountOfCardsX * currentDiff.configurations.amountOfCardsY;
        var pairsNeeded = totalCards / 2;
        var availableCards = currentDeck.cards.slice(0);
        var selectedPairs;
        var gamePool = [];
        var idx;
        var cardSlot;
        var imgElement;
        var allCards;

        // Limpiar cualquier renderizado anterior
        tableBoard.innerHTML = '';

        // Seteamos dinámicamente la cantidad de columnas requeridas por la dificultad en el CSS
        tableBoard.style.setProperty('--columns', currentDiff.configurations.amountOfCardsX);

        // Si boardMatrix está vacío (partida nueva), generamos las parejas y mezclamos
        if (!activeGame.boardMatrix || activeGame.boardMatrix.length === 0) {
            availableCards = shuffle(availableCards);
            selectedPairs = availableCards.slice(0, pairsNeeded);

            for (idx = 0; idx < selectedPairs.length; idx++) {
                gamePool.push(selectedPairs[idx]);
                gamePool.push(selectedPairs[idx]);
            }
            gamePool = shuffle(gamePool);

            activeGame.boardMatrix = [];
            for (idx = 0; idx < gamePool.length; idx++) {
                activeGame.boardMatrix.push({
                    index: idx,
                    cardId: gamePool[idx].id,
                    img: gamePool[idx].img,
                    name: gamePool[idx].name,
                    isMatched: false
                });
            }

            activeGame.startDatetime = new Date();
            saveCurrentGame(activeGame);
        }

        for (idx = 0; idx < activeGame.boardMatrix.length; idx++) {
            cardSlot = document.createElement('div');
            cardSlot.className = 'tableCard';
            cardSlot.setAttribute('data-index', activeGame.boardMatrix[idx].index);

            cardSlot.cardData = activeGame.boardMatrix[idx];

            if (activeGame.boardMatrix[idx].isMatched) {
                cardSlot.classList.add('revealed');
            }

            imgElement = document.createElement('img');
            imgElement.src = '../' + activeGame.boardMatrix[idx].img;
            imgElement.alt = activeGame.boardMatrix[idx].name;

            cardSlot.appendChild(imgElement);

            cardSlot.addEventListener('click', selectCard);
            tableBoard.appendChild(cardSlot);
        }

        //Muestra el tablero por unos segundos y luego da vuelta todas las cartas
        lockBoard = true;
        allCards = document.querySelectorAll('.tableCard');

        for (idx = 0; idx < allCards.length; idx++) {
            allCards[idx].classList.add('revealed');
        }

        setTimeout(function () {
            var innerIdx;
            var cardIndex;
            for (innerIdx = 0; innerIdx < allCards.length; innerIdx++) {
                cardIndex = parseInt(allCards[innerIdx].getAttribute('data-index'), 10);
                if (!activeGame.boardMatrix[cardIndex].isMatched) {
                    allCards[innerIdx].classList.remove('revealed');
                }
            }
            lockBoard = false;
        }, 5000);
    }

    function checkEndGame() {
        var idx;
        var allMatched = true;
        var noTimeRemaining = false;
        var deckUsed;
        var difficultySelected;
        var hardDifficulty = 3;
        var nextDifficulty = difficultySelected;
        var newGameSetup;

        for (idx = 0; idx < activeGame.boardMatrix.length; idx++) {
            if (activeGame.boardMatrix[idx].isMatched === false) {
                allMatched = false;
                break;
            }
        }

        noTimeRemaining = activeGame.remainingTime <= 0;

        if (allMatched || noTimeRemaining) {
            // Detener el temporizador si existe
            if (typeof gameTimerInterval !== 'undefined' && gameTimerInterval) {
                clearInterval(gameTimerInterval);
            }

            deckUsed = activeGame.deckUsed;
            difficultySelected = activeGame.difficulty;

            // Si la partida es progresiva y no hemos llegado a la dificultad máxima
            if (isProgressiveMode) {
                activeGame.finalDatetime = new Date();
                saveGameResult(activeGame);
                nextDifficulty = difficultySelected;
                console.log("Comparing: " + difficultySelected  + " - " +hardDifficulty)
                if (difficultySelected != hardDifficulty) nextDifficulty = difficultySelected + 1;
                
                newGameSetup = {
                    attempt: (activeGame.attempt || 1) + 1,
                    isProgressiveMode: true,
                    failuresCount: activeGame.failuresCount || 0,
                    actualStreak: activeGame.actualStreak || 0,
                    playerName: getCurrentUsername(),
                    clicks: activeGame.clicks || 0,
                    score: activeGame.score || 0,
                    timeInSeconds: activeGame.timeInSeconds || 0,
                    remainingTime: activeGame.remainingTime || 300, // o resetear tiempo si corresponde
                    date: new Date().toISOString().slice(0, 10),
                    deckUsed: deckUsed,
                    difficulty: nextDifficulty,
                    boardMatrix: []
                };
                saveCurrentGame(newGameSetup);
                redirectTo("game");
                return;
            }

            // Si terminó el modo normal o ya superó el nivel máximo progresivo:
            activeGame.finalDatetime = new Date();
            saveGameResult(activeGame);
            localStorage.setItem('last_finished_game', JSON.stringify(activeGame));
            clearCurrentGame();

            // Pantalla de resultados
            redirectTo("finalScreen");
        }
    }
    //Sección PARTIDA

    function getActualDeckName() {
        var db = getDatabase();
        var activeGame = getCurrentGame();
        //Del listado de barajas que tengo, busco el título de la que actualmente estoy usando
        for (i = 0; i < db.decks.length; i++) {
            if (db.decks[i].id === activeGame.deckUsed) {
                deckName = db.decks[i].title;
                break;
            }
        }

        return deckName;
    }

    // Arrancar el motor del juego
    generateAndStartGame();
});