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