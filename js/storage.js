'use strict';
var databaseKeyName = 'memotest_db';

function generateDeckCards(themeName) {
    var cardsArray = [];
    var i;
    var cardNumber;
    var maxCardQuantity = 18;
    var defaultImagesPath = 'assets/images/defaults/';

    for (i = 1; i <= maxCardQuantity; i++) {
        cardNumber = i.toString();
        
        cardsArray.push({
            id: i,
            img: defaultImagesPath + themeName + '/' + cardNumber + '.png',
            name: themeName + ' ' + cardNumber
        });
    }

    return cardsArray;
}

function getInitialStorageStructure() {
    var defaultFolderNames = ['pokemon'];
    var decksArray = [];
    var i;
    var folderName;
    var formattedTitle;

    for (i = 0; i < defaultFolderNames.length; i++) {
        folderName = defaultFolderNames[i];
        
        formattedTitle = folderName.charAt(0).toUpperCase() + folderName.slice(1);

        decksArray.push({
            id: i + 1,
            title: formattedTitle,
            description: 'Mazo temático basado en ' + folderName,
            cards: generateDeckCards(folderName)
        });
    }

    return {
        system: {
            theme: 'light',
            soundsEnabled: true
        },
        player: {
            username: '',
            currentGame: null,
            games: []
        },
        difficulties: [
            {
                id: 1,
                description: 'Fácil',
                configurations: {
                    id: 1,
                    amountOfCardsX: 4,
                    amountOfCardsY: 4,
                    pointsOnCorrect: 100,
                    pointsOnError: 10,
                    multiplierOnCombo: 0.1,
                    bonusOnEnd: 300,
                    penalizationPerSecond: 1.0,
                    penalizationMultiplierOnError: 1.5
                }
            },
            {
                id: 2,
                description: 'Medio',
                configurations: {
                    id: 2,
                    amountOfCardsX: 4,
                    amountOfCardsY: 5,
                    pointsOnCorrect: 100,
                    pointsOnError: 20,
                    multiplierOnCombo: 0.15,
                    bonusOnEnd: 300,
                    penalizationPerSecond: 1.0,
                    penalizationMultiplierOnError: 1.5
                }
            },
            {
                id: 3,
                description: 'Difícil',
                configurations: {
                    id: 3,
                    amountOfCardsX: 6,
                    amountOfCardsY: 6,
                    pointsOnCorrect: 100,
                    pointsOnError: 30,
                    multiplierOnCombo: 0.2,
                    bonusOnEnd: 300,
                    penalizationPerSecond: 1.0,
                    penalizationMultiplierOnError: 1.5
                }
            }
        ],
        decks: decksArray,
        games: []
    };
}

function initLocalStorage() {
    var existingData = localStorage.getItem(databaseKeyName);
    
    if (!existingData) {
        localStorage.setItem(databaseKeyName, JSON.stringify(getInitialStorageStructure()));
    }
}

function getDatabase() {
    var data = localStorage.getItem(databaseKeyName);
    return data ? JSON.parse(data) : getInitialStorageStructure();
}

function saveDatabase(db) {
    localStorage.setItem(databaseKeyName, JSON.stringify(db));
}

function getCurrentUsername() {
    var db = getDatabase();
    return db.player.username;
}

function setCurrentUsername(username) {
    var db = getDatabase();
    db.player.username = username;
    saveDatabase(db);
}

function deleteUserSession(){
    var db = getDatabase();
    db.player = 
    {
        username: '',
        currentGame: null,
        games: []
    };
    saveDatabase(db);
}

function getSystemTheme() {
    var db = getDatabase();
    return db.system.theme;
}

function setSystemTheme(theme) {
    var db = getDatabase();
    db.system.theme = theme;
    saveDatabase(db);
}

function isSoundsEnabled() {
    var db = getDatabase();
    return db.system.soundsEnabled;
}

function setSoundsEnabled(enabled) {
    var db = getDatabase();
    db.system.soundsEnabled = !!enabled;
    saveDatabase(db);
}

function getGameResults() {
    var db = getDatabase();
    return db.games;
}

function clearGameResults() {
    var db = getDatabase();
    db.games = [];
    db.player.games = [];
    saveDatabase(db);
}