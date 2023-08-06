const { app, BrowserWindow } = require('electron');
const path = require('path');
const gameFinder = require('./gameFinder');
const findAllGameFolders = require('./gameScanner');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.openDevTools();

    const allGamePaths = findAllGameFolders();
    console.log(allGamePaths);
    // Vérifiez si de nouveaux jeux ont été ajoutés depuis le dernier démarrage
    gameFinder.findAndSaveGames();
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();

    }
});
