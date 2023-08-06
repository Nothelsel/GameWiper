const fs = require('fs');
const path = require('path');

const gamesFilePath = path.join(__dirname, '../../data/games.json');

window.onload = function () {
    const gameListSection = document.getElementById('games-list');

    let games;
    try {
        games = JSON.parse(fs.readFileSync(gamesFilePath, 'utf-8'));
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier games.json:', err);
        return;
    }

    games.forEach(game => {
        const gameItem = document.createElement('li');
        gameItem.classList.add('game-card');

        const gameName = document.createElement('span');
        gameName.textContent = game.name;
        gameItem.appendChild(gameName);

        const gameSize = document.createElement('span');
        gameSize.textContent = `${game.size} Go`;
        gameItem.appendChild(gameSize);

        const deleteBtn = document.createElement('img');
        deleteBtn.src = path.join(__dirname, '../../assets/img/delete.svg');
        deleteBtn.alt = 'Supprimer';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = function () {
            if (confirm('Voulez-vous vraiment supprimer ce jeu ?')) {
                // Supprimer le jeu de la liste
                const index = games.indexOf(game);
                games.splice(index, 1);

                // Enregistrer la nouvelle liste dans le fichier games.json
                fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 4));

                // Actualiser la liste des jeux
                gameListSection.removeChild(gameItem);
            }
        };

        const folderBtn = document.createElement('img');
        folderBtn.src = path.join(__dirname, '../../assets/img/folder.svg');
        folderBtn.alt = 'Ouvrir le dossier';
        folderBtn.classList.add('folder-btn');
        folderBtn.onclick = function () {
            const { shell } = require('electron');
            const gamePath = game.path;

            if (fs.existsSync(gamePath)) {
                shell.openPath(gamePath);
            } else {
                alert('Le chemin du dossier du jeu est introuvable.');
            }
        }

        gameItem.appendChild(folderBtn);
        gameItem.appendChild(deleteBtn);

        gameListSection.appendChild(gameItem);

    });
};
