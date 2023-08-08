const fs = require('fs');
const path = require('path');
import LogService from '../services/logService';

const gamesFilePath = path.join(__dirname, '../../data/games.json');


const gameDirectories = [
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    // Ajoutez d'autres répertoires comme ceux d'Epic Games, GOG, etc.
    'C:\\Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\games',
    'C:\\Program Files (x86)\\Origin Games',
    'C:\\Program Files (x86)\\Bethesda.net Launcher\\games',
    'C:\\Program Files (x86)\\Battle.net\\Games',
];

function getDirectorySize(directory,logger) {
    const fileList = fs.readdirSync(directory);
    let directorySize = 0;
    logger.logToFile(`Calculating size of ${directory}...`);
    fileList.forEach(file => {
        const filePath = path.join(directory, file);
        const fileStats = fs.statSync(filePath);

        
        logger.logToFile(`Found ${fileStats.size} bytes in ${filePath}`);
        if (fileStats.isDirectory()) {
            directorySize += getDirectorySize(filePath);  // recursive call
        } else {
            directorySize += fileStats.size;
        }
        logger.logToFile(`Total size is now ${directorySize} bytes`);
    });

    return parseFloat((directorySize / (1024 * 1024 * 1024)).toFixed(2)); // Convert to GBs with 2 decimal places
}



function findGamesInDirectory(directory, logger) {
    let games = [];
    if (fs.existsSync(directory)) {
        const directories = fs.readdirSync(directory).filter(item => fs.statSync(path.join(directory, item)).isDirectory());
        games = directories.map(dir => {
            const gameDirectory = path.join(directory, dir);
            return {
                name: dir,
                size: getDirectorySize(gameDirectory, logger),
                path: gameDirectory
            };
        });
    }
    return games;
}

function findAllGames() {
    let allGames = [];
    const logger = new LogService();
    for (let dir of gameDirectories) {
        allGames = allGames.concat(findGamesInDirectory(dir, logger));
    }
    return allGames;
}

function getCurrentSavedGames() {
    if (fs.existsSync(gamesFilePath)) {
        const content = fs.readFileSync(gamesFilePath, 'utf-8');
        return JSON.parse(content);
    }
    return [];
}

function findAndSaveGames() {
    const newGames = findAllGames();
    const currentGames = getCurrentSavedGames();

    // En supposant que chaque jeu a un nom unique.
    const gameNames = currentGames.map(game => game.name);

    // Filtrer les nouveaux jeux qui n'existent pas dans la liste actuelle.
    const uniqueNewGames = newGames.filter(game => !gameNames.includes(game.name));

    const updatedGameList = currentGames.concat(uniqueNewGames);

    fs.writeFileSync(gamesFilePath, JSON.stringify(updatedGameList, null, 2));
}

function removeGame(gameName) {
    const currentGames = getCurrentSavedGames();
    const updatedGames = currentGames.filter(game => game !== gameName);

    fs.writeFileSync(gamesFilePath, JSON.stringify(updatedGames, null, 2));

    // Supprimer le jeu du disque (soyez prudent avec cela car cela supprimera réellement le jeu)
    for (let dir of gameDirectories) {
        const gamePath = path.join(dir, gameName);
        if (fs.existsSync(gamePath)) {
            fs.rmdirSync(gamePath, { recursive: true });
            break;
        }
    }
}

module.exports = {
    findAndSaveGames,
    removeGame
};
