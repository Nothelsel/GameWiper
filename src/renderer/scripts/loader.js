const fs = require('fs');
const path = require('path');
const LogService = require('../services/logService.js');

const gamesFilePath = path.join(__dirname, '../../data/games.json');

window.onload = function() {

    loadGamesAndDisplay();
    setupSortingHandlers();
};

function loadGamesAndDisplay() {
    const games = loadGamesFromFile();
    if (!games) return;
    displayGames(games);
}

function loadGamesFromFile() {
    const logger = new LogService();
    try {
        return logger.getGamesFromStorage();
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier games.json:', err);
        return null;
    }
}

function displayGames(games) {
    const gameListSection = document.getElementById('games-list');
    // Supprimez d'abord tous les éléments existants
    while (gameListSection.firstChild) {
        gameListSection.removeChild(gameListSection.firstChild);
    }
    // Puis ajoutez les éléments triés
    games.forEach(game => {
        const gameItem = createGameListItem(game);
        appendToGameList(gameItem);
    });
}

function createGameListItem(game) {
    const gameItem = document.createElement('li');
    gameItem.classList.add('game-card');

    gameItem.appendChild(createGameNameElement(game.name));
    gameItem.appendChild(createGameSizeElement(game.size));
    gameItem.appendChild(createButton('../../assets/img/folder.svg', 'Ouvrir le dossier', 'folder-btn', () => openGameFolder(game.path)));
    gameItem.appendChild(createButton('../../assets/img/delete.svg', 'Supprimer', 'delete-btn', () => handleGameDeletion(game)));

    return gameItem;
}

function createGameNameElement(name) {
    const gameName = document.createElement('span');
    gameName.textContent = name;
    return gameName;
}

function createGameSizeElement(size) {
    const gameSize = document.createElement('span');
    gameSize.textContent = `${size} Go`;
    return gameSize;
}

function createButton(src, alt, className, action) {
    const btn = document.createElement('img');
    btn.src = path.join(__dirname, src);
    btn.alt = alt;
    btn.classList.add(className);
    btn.onclick = action;
    return btn;
}

function handleGameDeletion(game) {
    if (!confirm('Voulez-vous vraiment supprimer ce jeu ?')) return;
    const logger = new LogService();
    const updatedGames = logger.removeGame(game.name);
    displayGames(updatedGames);  // Remise à jour de l'affichage après suppression
}

function openGameFolder(gamePath) {
    const { shell } = require('electron');

    if (fs.existsSync(gamePath)) {
        shell.openPath(gamePath);
    } else {
        alert('Le chemin du dossier du jeu est introuvable.');
    }
}

function appendToGameList(gameItem) {
    const gameListSection = document.getElementById('games-list');
    gameListSection.appendChild(gameItem);
}

function setupSortingHandlers() {
    const games = loadGamesFromFile();

    document.getElementById('sort-by-name').addEventListener('click', () => {
        sortGamesByName(games);
        displayGames(games);
    });

    document.getElementById('sort-by-size').addEventListener('click', () => {
        sortGamesBySize(games);
        displayGames(games);
    });
}

function sortGamesByName(games) {
    games.sort((a, b) => a.name.localeCompare(b.name));
}

function sortGamesBySize(games) {
    games.sort((a, b) => b.size - a.size);
}
