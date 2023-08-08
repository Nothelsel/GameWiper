const path = require('path');
const fs = require('fs');

class LogService {
    constructor() {
        this.logFilePath = path.join(__dirname, '../outputs/log.txt');
        this.gamesStoragePath = path.join(__dirname, '../../data/games.json');

        // Vérifier si le dossier 'outputs' existe
        if (!fs.existsSync(path.join(__dirname, '../outputs'))) {
            fs.mkdirSync(path.join(__dirname, '../outputs'));
        }

        // Vérifier si le fichier 'log.txt' existe
        if (!fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, ''); // Créer le fichier s'il n'existe pas
        }
    }

    logToFile(message) {
        // Écriture dans un fichier en mode "append"
        fs.appendFileSync(this.logFilePath, message + '\n');
    }

    fillGamesStorage(games) {
        fs.writeFileSync(this.gamesStoragePath, JSON.stringify(games, null, 2));
    }

    getGamesFromStorage() {
        if (fs.existsSync(this.gamesStoragePath)) {
            const content = fs.readFileSync(this.gamesStoragePath, 'utf-8');
            return JSON.parse(content);
        }
        return [];
    }

    removeGame(gameName) {
        const games = this.getGamesFromStorage();
        const updatedGames = games.filter(game => game.name !== gameName);
        this.fillGamesStorage(updatedGames);
        
    }
}

module.exports = LogService;
