const fs = require('fs');
const path = require('path');
const LogService = require('../services/logService.js')
const findAllGameFolders = require('./folderScanner');


function getDirectorySize(directory) {
    if (!fs.existsSync(directory)) {
        return 0;
    }
    const fileList = fs.readdirSync(directory);
    let directorySize = 0;
    fileList.forEach(file => {
        const filePath = path.join(directory, file);
        const fileStats = fs.statSync(filePath);
        if (fileStats.isDirectory()) {
            directorySize += getDirectorySize(filePath);  // recursive call
        } else {
            directorySize += fileStats.size;
        }
    });

    return directorySize;
}

function findGamesInDirectory(directory) {
    let games = [];
    if (fs.existsSync(directory)) {
        const directories = fs.readdirSync(directory).filter(item => fs.statSync(path.join(directory, item)).isDirectory());

        games = directories.map(dir => {
            const gameDirectory = path.join(directory, dir);
            const gameSize = parseFloat((getDirectorySize(gameDirectory) / (1024 * 1024 * 1024)).toFixed(2))
            return {
                name: dir,
                size: gameSize,
                path: gameDirectory
            };
        });
    }
    return games;
}


function findAllGames(allGamePaths) {
    let allGames = [];
    for (let dir of allGamePaths) {
        allGames = allGames.concat(findGamesInDirectory(dir));
    }
    return allGames;
}


async function findAndSaveGames() {
    const logger = new LogService();
    const allGamePaths = await findAllGameFolders();
    const newGames = findAllGames(allGamePaths);
    const currentGames = logger.getGamesFromStorage();
    // En supposant que chaque jeu a un nom unique.
    const gameNames = currentGames.map(game => game.name);
    // Filtrer les nouveaux jeux qui n'existent pas dans la liste actuelle.
    const uniqueNewGames = newGames.filter(game => !gameNames.includes(game.name));
    const updatedGameList = currentGames.concat(uniqueNewGames);
    logger.fillGamesStorage(updatedGameList);
}

function removeGame(gameName, logger) {
    logger.removeGame(gameName);
}

module.exports = {
    findAndSaveGames,
    removeGame
};
