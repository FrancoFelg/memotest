document.addEventListener("DOMContentLoaded", function () {
    var activeGame = getCurrentGame();
    var noActiveGame = activeGame === null;
    var isProgressiveMode = activeGame ? activeGame.isProgressiveMode : false;
    var gameTimerInterval = null;
    var gameScore = 0;

    if (noActiveGame) {
        redirectTo("prestartGame");
        return;
    }

    var db = getDatabase();

    var deckNameText = document.getElementById("deckNameText");
    var deckName = "";
    var timerText = document.getElementById("timerText");
    var errorsCount = document.getElementById("errorsCountText");
    var streak = document.getElementById("streakText");
    var retryCount = document.getElementById("retryCountText");
    var scoreElement = document.getElementById("scoreElement");
    var btnEndgame = document.getElementById("endgameButton");

    if (btnEndgame) {
        btnEndgame.addEventListener("click", function () {
            endGame();
        });
    }

    errorsCount.innerText = activeGame.failuresCount || 0;
    streak.innerText = activeGame.actualStreak || 0;
    retryCount.innerText = activeGame.attempt || 1;

    // Settear el nombre de la baraja actual
    if (db && db.decks && activeGame.deckUsed) {
        deckName = getActualDeckName();
        if (deckNameText) deckNameText.textContent = deckName;
    }

    var currentDiff = null;
    var currentDeck = null;
    var cardsFlipped = []; // Arreglo de control de turnos
    var lockBoard = false;  // Bandera para bloquear clics
    var i;

    // Función auxiliar para actualizar los objetos BBDD segun la dificultad/mazo activos
    function syncDatabaseConfig() {
        var idx;
        for (idx = 0; idx < db.difficulties.length; idx++) {
            if (db.difficulties[idx].id === activeGame.difficulty) {
                currentDiff = db.difficulties[idx];
                break;
            }
        }
        for (idx = 0; idx < db.decks.length; idx++) {
            if (db.decks[idx].id === activeGame.deckUsed) {
                currentDeck = db.decks[idx];
                break;
            }
        }
    }

    syncDatabaseConfig();

    if (typeof activeGame.remainingTime !== "number") {
        activeGame.remainingTime = 300;
    }

    // Iniciar el temporizador descendente
    startCountdownTimer(activeGame, timerText, scoreElement);

    function startCountdownTimer(activeGame, timerElement, scoreElement) {
        updateTimerDisplay(activeGame.remainingTime, timerElement);
        if (gameTimerInterval) clearInterval(gameTimerInterval);

        gameTimerInterval = setInterval(function () {
            updateEachSecond(timerElement, scoreElement);
        }, 1000);
    }

    function updateEachSecond(timerElement, scoreElement) {
        activeGame.remainingTime--;
        activeGame.timeInSeconds = (activeGame.timeInSeconds || 0) + 1;

        saveCurrentGame(activeGame);
        updateTimerDisplay(activeGame.remainingTime, timerElement);

        var noTimeRemaining = activeGame.remainingTime <= 0;
        if (noTimeRemaining) {
            clearInterval(gameTimerInterval);
            checkEndGame();
            return;
        }

        if (activeGame.score > 0) activeGame.score -= currentDiff.configurations.penalizationPerSecond;

        if (scoreElement) scoreElement.innerText = activeGame.score.toFixed(2);
        if (errorsCount) errorsCount.innerText = activeGame.failuresCount;
        if (streak) streak.innerText = activeGame.actualStreak;
        if (retryCount) retryCount.innerText = activeGame.attempt;
    }

    function updateTimerDisplay(secondsTotal, element) {
        if (!element) return;
        var minutes = Math.floor(secondsTotal / 60);
        var seconds = secondsTotal % 60;
        var formattedMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
        var formattedSeconds = seconds < 10 ? "0" + seconds : seconds.toString();
        element.textContent = formattedMinutes + ":" + formattedSeconds;
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

    function selectCard(event) {
        var clickedCardSlot = event.currentTarget;
        var selectedEvtCard = clickedCardSlot.cardData;

        if (lockBoard || selectedEvtCard.isMatched || clickedCardSlot.classList.contains("revealed")) {
            return;
        }

        if (typeof SoundController !== "undefined") SoundController.play("flip");

        activeGame.clicks += 1;
        clickedCardSlot.classList.add("revealed");

        if (cardsFlipped.length === 0) {
            cardsFlipped.push({ element: clickedCardSlot, data: selectedEvtCard });
        } else if (cardsFlipped.length === 1) {
            cardsFlipped.push({ element: clickedCardSlot, data: selectedEvtCard });
            lockBoard = true;

            if (cardsFlipped[0].data.img === cardsFlipped[1].data.img) {
                // Coincidencia
                cardsFlipped[0].data.isMatched = true;
                cardsFlipped[1].data.isMatched = true;

                activeGame.actualStreak = (activeGame.actualStreak || 0) + 1;

                var pointsOnCorrect = currentDiff.configurations.pointsOnCorrect;
                var multiplierOnCombo = currentDiff.configurations.multiplierOnCombo;
                var currentStreak = activeGame.actualStreak;
                var pointsGained = pointsOnCorrect + (pointsOnCorrect * (multiplierOnCombo * (currentStreak - 1)));
                var rawScore = (activeGame.score || 0) + pointsGained;
                activeGame.score = parseFloat(rawScore.toFixed(2));

                cardsFlipped = [];
                lockBoard = false;

                saveCurrentGame(activeGame);
                checkEndGame();
            } else {
                // Error
                activeGame.failuresCount += 1;
                activeGame.actualStreak = 0;
                activeGame.score -= currentDiff.configurations.pointsOnError;

                if (activeGame.score < 0) activeGame.score = 0;

                saveCurrentGame(activeGame);

                setTimeout(function () {
                    if (typeof SoundController !== "undefined") SoundController.play("hide");

                    cardsFlipped[0].element.classList.remove("revealed");
                    cardsFlipped[1].element.classList.remove("revealed");

                    cardsFlipped = [];
                    lockBoard = false;
                }, 1000);
            }
        }
    }

    function generateAndStartGame() {
        var tableBoard = document.getElementById("tableBoard");
        if (scoreElement) scoreElement.innerText = (activeGame.score || 0).toFixed(2);

        // Sincronizar configuracion por si se subió la dificultad en modo progresivo
        syncDatabaseConfig();

        var totalCards = currentDiff.configurations.amountOfCardsX * currentDiff.configurations.amountOfCardsY;
        var pairsNeeded = totalCards / 2;
        var availableCards = currentDeck.cards.slice(0);
        var selectedPairs;
        var gamePool = [];
        var idx;
        var cardSlot;
        var imgElement;
        var allCards;

        tableBoard.innerHTML = "";
        tableBoard.style.setProperty("--columns", currentDiff.configurations.amountOfCardsX);

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
            cardSlot = document.createElement("div");
            cardSlot.className = "tableCard";
            cardSlot.setAttribute("data-index", activeGame.boardMatrix[idx].index);
            cardSlot.cardData = activeGame.boardMatrix[idx];

            if (activeGame.boardMatrix[idx].isMatched) {
                cardSlot.classList.add("revealed");
            }

            imgElement = document.createElement("img");
            var rawImg = activeGame.boardMatrix[idx].img || "";
            if (rawImg.indexOf("data:") === 0) {
                imgElement.src = rawImg;
            } else {
                imgElement.src = "../" + rawImg;
            }

            imgElement.alt = activeGame.boardMatrix[idx].name;
            cardSlot.appendChild(imgElement);

            cardSlot.addEventListener("click", selectCard);
            tableBoard.appendChild(cardSlot);
        }

        // Vista previa inicial de cartas
        lockBoard = true;
        allCards = document.querySelectorAll(".tableCard");

        for (idx = 0; idx < allCards.length; idx++) {
            allCards[idx].classList.add("revealed");
        }

        setTimeout(function () {
            var innerIdx;
            var cardIndex;
            for (innerIdx = 0; innerIdx < allCards.length; innerIdx++) {
                cardIndex = parseInt(allCards[innerIdx].getAttribute("data-index"), 10);
                if (!activeGame.boardMatrix[cardIndex].isMatched) {
                    allCards[innerIdx].classList.remove("revealed");
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
        var nextDifficulty;
        var newGameSetup;

        for (idx = 0; idx < activeGame.boardMatrix.length; idx++) {
            if (activeGame.boardMatrix[idx].isMatched === false) {
                allMatched = false;
                break;
            }
        }

        noTimeRemaining = activeGame.remainingTime <= 0;

        if (allMatched || noTimeRemaining) {
            var isVictory = allMatched;

            if (gameTimerInterval) {
                clearInterval(gameTimerInterval);
            }

            deckUsed = activeGame.deckUsed;
            difficultySelected = activeGame.difficulty;
            activeGame.isVictory = isVictory;
            activeGame.finalDatetime = new Date();

            // TRANSICIÓN AL SIGUIENTE NIVEL EN MODO PROGRESIVO
            if (isProgressiveMode && isVictory && difficultySelected < hardDifficulty) {
                saveGameResult(activeGame);

                nextDifficulty = difficultySelected + 1;

                // Buscar los datos de la nueva dificultad en la BBDD para mostrárselos al usuario
                var nextDiffObj = null;
                for (var d = 0; d < db.difficulties.length; d++) {
                    if (db.difficulties[d].id === nextDifficulty) {
                        nextDiffObj = db.difficulties[d];
                        break;
                    }
                }

                // Mostrar la notificación/pestaña antes de re-generar el tablero
                showLevelUpNotification(nextDiffObj, function () {
                    // Este callback se ejecuta cuando pasan los 3.5 segundos de la notificación

                    newGameSetup = {
                        attempt: (activeGame.attempt || 1) + 1,
                        isProgressiveMode: true,
                        failuresCount: activeGame.failuresCount || 0,
                        actualStreak: activeGame.actualStreak || 0,
                        playerName: getCurrentUsername(),
                        clicks: activeGame.clicks || 0,
                        score: activeGame.score || 0,
                        timeInSeconds: activeGame.timeInSeconds || 0,
                        remainingTime: 300,
                        date: new Date().toISOString().slice(0, 10),
                        deckUsed: deckUsed,
                        difficulty: nextDifficulty,
                        boardMatrix: []
                    };

                    activeGame = newGameSetup;
                    saveCurrentGame(activeGame);

                    cardsFlipped = [];
                    lockBoard = false;

                    syncDatabaseConfig();
                    if (retryCount) retryCount.innerText = activeGame.attempt;

                    generateAndStartGame();
                    startCountdownTimer(activeGame, timerText, scoreElement);
                });

                return;
            }

            // Fin definitivo del juego
            saveGameResult(activeGame);
            localStorage.setItem("last_finished_game", JSON.stringify(activeGame));
            clearCurrentGame();

            redirectTo("finalScreen");
        }
    }

    function getActualDeckName() {
        var db = getDatabase();
        var activeGame = getCurrentGame();
        for (i = 0; i < db.decks.length; i++) {
            if (db.decks[i].id === activeGame.deckUsed) {
                deckName = db.decks[i].title;
                break;
            }
        }
        return deckName;
    }

    // Función para mostrar la alerta de "Siguiente Nivel"
    function showLevelUpNotification(nextDiffObj, callback) {
        var overlay = document.getElementById("levelUpOverlay");
        var title = document.getElementById("levelUpTitle");
        var desc = document.getElementById("levelUpDesc");

        if (!overlay || !title || !desc) {
            // Si no existen los elementos en el HTML, continúa el flujo sin pausar
            if (callback) callback();
            return;
        }

        // Configurar textos según la nueva dificultad
        title.innerText = "¡Siguiente Nivel: " + (nextDiffObj.title || "Nivel Superior") + "!";

        var cardsX = nextDiffObj.configurations.amountOfCardsX;
        var cardsY = nextDiffObj.configurations.amountOfCardsY;
        var totalCards = cardsX * cardsY;

        desc.innerText = "Preparando tablero de " + totalCards + " cartas (" + cardsX + "x" + cardsY + "). ¡Buena suerte!";

        // Mostrar el modal
        overlay.classList.remove("hidden");

        // Reproducir un sonido si tienes SoundController configurado
        if (typeof SoundController !== "undefined") {
            SoundController.play("victory"); // O el sonido que utilices
        }

        // Ocultar modal después de 3.5 segundos y ejecutar la preparación del juego
        setTimeout(function () {
            overlay.classList.add("hidden");
            if (callback) callback();
        }, 3500);
    }

    function endGame() {
        activeGame.finalDatetime = new Date();
        saveGameResult(activeGame);
        localStorage.setItem("last_finished_game", JSON.stringify(activeGame));
        clearCurrentGame();
        redirectTo("finalScreen");
    }

    // Arrancar el motor del juego
    generateAndStartGame();
});