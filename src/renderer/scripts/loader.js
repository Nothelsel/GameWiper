const fs = require('fs');
const path = require('path');
const LogService = require('../services/logService.js');

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

    gameItem.appendChild(createGameDetailElement(game.name, 'name'));
    if(game.lastUsed) gameItem.appendChild(createGameDetailElement(game.lastUsed, 'lastUsed'));
    gameItem.appendChild(createGameDetailElement(game.size, 'size'));
    gameItem.appendChild(createButton('../../assets/img/folder.svg', 'Ouvrir le dossier', 'folder-btn', () => openGameFolder(game.path)));
    gameItem.appendChild(createButton('../../assets/img/delete.svg', 'Supprimer', 'delete-btn', () => handleGameDeletion(game)));

    return gameItem;
}

function createGameDetailElement(content, type) {
    const element = document.createElement('span');
    
    switch (type) {
        case 'name':
            element.textContent = content;
            break;
        case 'size':
            element.textContent = `${content} Go`;
            break;
        case 'lastUsed':
            element.textContent = content;
        default:
            console.error('Invalid type for game detail element.');
    }

    return element;
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
    deleteFolder(game.path);  // Suppression du dossier du jeu
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

function deleteFolder(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const currentPath = path.join(directoryPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteFolder(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });
        fs.rmdirSync(directoryPath);
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
