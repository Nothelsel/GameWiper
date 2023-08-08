export default class LogService {
    constructor() {
        this.logFilePath = path.join(__dirname, '../outputs/log.txt');
    }

    logToFile(message) {
        // Écriture dans un fichier en mode "append"
        fs.appendFileSync(this.logFilePath, message + '\n');
    }
}