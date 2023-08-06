const fs = require('fs');
const path = require('path');

// Les noms des répertoires de jeux courants que nous voulons trouver.
const gameDirectoriesNames = [
    'Steam\\steamapps\\common',
    'Ubisoft\\Ubisoft Game Launcher\\games',
    'Origin Games',
    'Bethesda.net Launcher\\games',
    'Battle.net\\Games',
    // Ajoutez d'autres noms de répertoire de jeux au besoin.
];

function findGameDirectories(startPath) {
    let gamePaths = [];

    if (!fs.existsSync(startPath)) {
        return gamePaths;
    }

    let files = [];
    try {
        files = fs.readdirSync(startPath);
    } catch (err) {
        console.error(`Erreur lors de la lecture du répertoire ${startPath}: ${err.message}`);
        return gamePaths;
    }

    for (let file of files) {
        const curPath = path.join(startPath, file);

        let isDirectory = false;
        try {
            isDirectory = fs.lstatSync(curPath).isDirectory();
        } catch (err) {
            console.error(`Erreur lors de l'accès au chemin ${curPath}: ${err.message}`);
            continue;  // Passez à la prochaine itération
        }

        if (isDirectory) {
            if (gameDirectoriesNames.some(dirName => curPath.endsWith(dirName))) {
                gamePaths.push(curPath);
            }
            gamePaths = gamePaths.concat(findGameDirectories(curPath));
        }
    }

    return gamePaths;
}

function getAllTargetDirectories() {
    const targetDirs = ['Program Files', 'Program Files (x86)'];
    
    // Ceci fonctionne principalement sur Windows car il liste les lecteurs comme C:, D:, etc.
    let drives = [];
    for (let i = 65; i <= 90; i++) {
        const drive = String.fromCharCode(i) + ":\\";
        if (fs.existsSync(drive)) {
            targetDirs.forEach(dir => {
                const fullPath = path.join(drive, dir);
                if (fs.existsSync(fullPath)) {
                    drives.push(fullPath);
                }
            });
        }
    }
    return drives;
}

function findAllGameFolders() {
    const targetDirectories = getAllTargetDirectories();
    let allGameDirs = [];

    for (let dir of targetDirectories) {
        allGameDirs = allGameDirs.concat(findGameDirectories(dir));
    }

    return allGameDirs;
}

module.exports = findAllGameFolders;
