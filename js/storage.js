'use strict';
var databaseKeyName = 'memotest_db';

function getInitialStorageStructure() {
    return {
        system: {
            theme: 'light',
            soundsEnabled: true
        },
        player: {
            username: '',
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
        decks: [
            {
                id: 1,
                title: 'Pokémon',
                description: 'Cartas con personajes de Pokémon',
                cards: []
            },
            {
                id: 2,
                title: 'Países',
                description: 'Banderas de diferentes países',
                cards: []
            }
        ],
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