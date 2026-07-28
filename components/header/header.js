'use strict';

var btnLogout = document.getElementById("btnLogout");
var navStats = document.getElementById("navStats");
var rankingModal = document.getElementById("rankingModal");
var btnCloseRanking = document.getElementById("btnCloseRanking");
var rankingSort = document.getElementById("rankingSort");
var btnTheme = document.getElementById("btnTheme");
var btnClearRanking = document.getElementById("btnClearRanking");

if (btnLogout) {
    btnLogout.addEventListener('click', function () {
        logout();
    });
}

if (btnTheme) {
    btnTheme.addEventListener("click", function () {

        if (getSystemTheme() === "light") {
            setSystemTheme("dark");
        } else {
            setSystemTheme("light");
        }

        applyTheme();
        updateThemeButton();
    });
}

if (navStats && rankingModal) {
    navStats.addEventListener('click', function (e) {
        e.preventDefault();
        rankingModal.classList.remove('hidden');

        rankingSort.value = "score";
        loadRanking("score");
    });
}

if (btnCloseRanking && rankingModal) {
    btnCloseRanking.addEventListener('click', function () {
        rankingModal.classList.add('hidden');
    });
}

if (btnClearRanking) {

    btnClearRanking.addEventListener("click", function () {

        clearGameResults();
        loadRanking(rankingSort.value);

    });

}

if (rankingSort) {
    rankingSort.addEventListener("change", function () {
        loadRanking(this.value);
    });
}

function updateThemeButton() {

    if (!btnTheme) {
        return;
    }

    if (getSystemTheme() === "dark") {
        btnTheme.innerHTML = "☀️";
    } else {
        btnTheme.innerHTML = "🌙";
    }

}

function sortGames(games, criteria) {

    if (criteria === "score") {
        games.sort(function (a, b) {
            return b.score - a.score;
        });
    }

    if (criteria === "difficulty") {
        games.sort(function (a, b) {
            return a.difficulty - b.difficulty;
        });
    }

    if (criteria === "date") {
        games.sort(function (a, b) {
            return new Date(b.finalDatetime) - new Date(a.finalDatetime);
        });
    }

    if (criteria === "duration") {
        games.sort(function (a, b) {
            return b.timeInSeconds - a.timeInSeconds;
        });
    }

}

function loadRanking(criteria) {
    var games = getGameResults();

    sortGames(games, criteria);

    var tableBody = document.getElementById("rankingTableBody");

    tableBody.innerHTML = "";

    var i;
    var row;

    for (i = 0; i < games.length; i++) {

        row = document.createElement("tr");

        row.innerHTML =
            "<td>" + games[i].playerName + "</td>" +
            "<td>" + Math.round(games[i].score) + "</td>" +
            "<td>" + games[i].difficulty + "</td>" +
            "<td>" + games[i].attempt + "</td>" +
            "<td>" + games[i].failuresCount + "</td>" +
            "<td>" + games[i].timeInSeconds + " s</td>" +
            "<td>" + games[i].date + "</td>";

        tableBody.appendChild(row);
    }
}

updateThemeButton();