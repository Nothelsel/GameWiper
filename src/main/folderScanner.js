const fs = require('fs');
const path = require('path');

// Les noms des répertoires de jeux courants que nous voulons trouver.
const gameDirectoriesNames = [
    'Steam\\steamapps\\common',
    'Ubisoft\\Ubisoft Game Launcher\\games',
    'Origin Games',
    'Bethesda.net Launcher\\games',
    'Battle.net\\Games',
    'Epic Games',
    'GOG Galaxy\\Games',
    'Rockstar Games\\Launcher\\games',
    'Minecraft Launcher\\game',
];

function findGameDirectories(startPath) {
    return new Promise((resolve) => {
        let gamePaths = [];

        try {
            if (!fs.existsSync(startPath)) {
                resolve(gamePaths);
            }

            for (let gameDir of gameDirectoriesNames) {
                const fullPath = path.join(startPath, gameDir);
                if (fs.existsSync(fullPath)) {
                    gamePaths.push(fullPath);
                }
            }

            resolve(gamePaths);
        } catch (err) {
            console.error(`Erreur lors de la recherche dans ${startPath}: ${err.message}`);
            resolve([]);  // En cas d'erreur, renvoyez une liste vide.
        }
    });
}

function getAllProgramFilesDirectories() {
    // Renvoie les répertoires Program Files des lecteurs existants
    let directories = [];
    for (let i = 65; i <= 90; i++) {
        const drive = String.fromCharCode(i) + ":\\";
        try {
            if (fs.existsSync(drive)) {
                directories.push(path.join(drive, 'Program Files'));
                directories.push(path.join(drive, 'Program Files (x86)'));
            }
        } catch (err) {
            console.error(`Erreur lors de la vérification du lecteur ${drive}: ${err.message}`);
        }
    }
    return directories;
}

async function findAllGameFolders() {
    const programFilesDirs = getAllProgramFilesDirectories();
    let allPromises = programFilesDirs.map(dir => findGameDirectories(dir));

    let allGameDirs = [];
    try {
        const results = await Promise.all(allPromises);
        results.forEach(result => {
            allGameDirs = allGameDirs.concat(result);
        });
    } catch (err) {
        console.error(`Erreur lors de la recherche des dossiers de jeux: ${err.message}`);
    }

    return allGameDirs;
}

module.exports = findAllGameFolders;
