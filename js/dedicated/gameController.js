'use strict';

document.addEventListener('DOMContentLoaded', function () {
    var activeGame = getCurrentGame();
    var noActiveGame = activeGame === null;

    if (noActiveGame) {
        redirectTo("prestartGame")
        return;
    }

    // Variables de control del juego en memoria global del script (ES5)
    var db = getDatabase();
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

    function generateAndStartGame() {
        var tableBoard = document.getElementById('tableBoard');
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

        if (activeGame.clicks === 0) {
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

                // ¡COINCIDENCIA EXITOSA! (El resto del código queda exactamente igual)
                cardsFlipped[0].data.isMatched = true;
                cardsFlipped[1].data.isMatched = true;

                activeGame.score += currentDiff.configurations.pointsOnCorrect;

                cardsFlipped = [];
                lockBoard = false;

                saveCurrentGame(activeGame);
                checkEndGame();
            } else {
                // Caso Fallido: No coinciden
                activeGame.failuresCount += 1;
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

    function checkEndGame() {
        var idx;
        var allMatched = true;

        for (idx = 0; idx < activeGame.boardMatrix.length; idx++) {
            if (activeGame.boardMatrix[idx].isMatched === false) {
                allMatched = false;
                break;
            }
        }

        if (allMatched) {
            // Guardar en el histórico de partidas finalizadas de storage.js
            saveGameResult(activeGame);

            // Establecer bandera de lectura limpia para finalScreen y vaciar el juego activo
            localStorage.setItem('last_finished_game', JSON.stringify(activeGame));
            clearCurrentGame();

            // Desvío final a la pantalla de resultados
            redirectTo("finalScreen");
        }
    }

    // Arrancar el motor del juego
    generateAndStartGame();
});