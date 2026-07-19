function saveCurrentGame(gameState) {
    var db = getDatabase();
    db.player.currentGame = gameState;
    saveDatabase(db);
}

function getCurrentGame() {
    var db = getDatabase();
    return db.player.currentGame;
}

function clearCurrentGame() {
    var db = getDatabase();
    db.player.currentGame = null;
    saveDatabase(db);
}

function saveGameResult(gameObj) {
    var db = getDatabase();
    gameObj.id = db.games.length + 1;
    db.games.push(gameObj);
    db.player.games.push(gameObj);
    saveDatabase(db);
}