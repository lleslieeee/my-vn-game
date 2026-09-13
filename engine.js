// ==========================================
// GAME STATE
// ==========================================

let gameState = {
    player: {
        name: "Hero",

        level: 1,
        xp: 0,

        hp: 100,
        maxHp: 100,

        mp: 20,
        maxMp: 20,

        gold: 50
    },

    position: {
        x: 250,
        y: 175
    },

    currentMap: "village",

    inventory: [],

    playTime: 0
};


// ==========================================
// SCREEN ELEMENTS
// ==========================================

const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const gameMenu = document.getElementById("game-menu");

const titleMessage = document.getElementById("title-message");
const menuMessage = document.getElementById("menu-message");

const playerElement = document.getElementById("player");


// ==========================================
// PLAYER UI
// ==========================================

const playerName = document.getElementById("player-name");
const playerLevel = document.getElementById("player-level");

const playerHp = document.getElementById("player-hp");
const playerMaxHp = document.getElementById("player-max-hp");

const playerMp = document.getElementById("player-mp");
const playerMaxMp = document.getElementById("player-max-mp");

const playerGold = document.getElementById("player-gold");


// ==========================================
// START NEW GAME
// ==========================================

function newGame() {

    gameState = {
        player: {
            name: "Hero",

            level: 1,
            xp: 0,

            hp: 100,
            maxHp: 100,

            mp: 20,
            maxMp: 20,

            gold: 50
        },

        position: {
            x: 250,
            y: 175
        },

        currentMap: "village",

        inventory: [],

        playTime: 0
    };

    showGame();
}


// ==========================================
// SHOW GAME
// ==========================================

function showGame() {

    titleScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    updateUI();
}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    playerName.textContent = gameState.player.name;

    playerLevel.textContent = gameState.player.level;

    playerHp.textContent = gameState.player.hp;
    playerMaxHp.textContent = gameState.player.maxHp;

    playerMp.textContent = gameState.player.mp;
    playerMaxMp.textContent = gameState.player.maxMp;

    playerGold.textContent = gameState.player.gold;

    playerElement.style.left =
        gameState.position.x + "px";

    playerElement.style.top =
        gameState.position.y + "px";
}


// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    localStorage.setItem(
        "myRPGSave",
        JSON.stringify(gameState)
    );

    menuMessage.textContent = "Game saved!";
}


// ==========================================
// LOAD GAME
// ==========================================

function loadGame() {

    const savedGame =
        localStorage.getItem("myRPGSave");

    if (!savedGame) {

        titleMessage.textContent =
            "No save file found.";

        return;
    }

    try {

        gameState = JSON.parse(savedGame);

        showGame();

    } catch (error) {

        console.error("Save file is corrupted:", error);

        titleMessage.textContent =
            "Unable to load save.";
    }
}


// ==========================================
// MENU
// ==========================================

function openMenu() {

    gameMenu.classList.remove("hidden");

    menuMessage.textContent = "";
}


function closeMenu() {

    gameMenu.classList.add("hidden");
}


function quitToTitle() {

    gameMenu.classList.add("hidden");
    gameScreen.classList.add("hidden");
    titleScreen.classList.remove("hidden");
}


// ==========================================
// MOVEMENT
// ==========================================

document.addEventListener("keydown", function(event) {

    if (gameScreen.classList.contains("hidden")) {
        return;
    }

    const speed = 10;

    switch (event.key) {

        case "ArrowUp":
            gameState.position.y -= speed;
            break;

        case "ArrowDown":
            gameState.position.y += speed;
            break;

        case "ArrowLeft":
            gameState.position.x -= speed;
            break;

        case "ArrowRight":
            gameState.position.x += speed;
            break;

        default:
            return;
    }

    // Keep player inside map

    gameState.position.x =
        Math.max(
            0,
            Math.min(500, gameState.position.x)
        );

    gameState.position.y =
        Math.max(
            0,
            Math.min(350, gameState.position.y)
        );

    updateUI();
});


// ==========================================
// BUTTONS
// ==========================================

document
    .getElementById("new-game-btn")
    .addEventListener("click", newGame);


document
    .getElementById("load-game-btn")
    .addEventListener("click", loadGame);


document
    .getElementById("menu-btn")
    .addEventListener("click", openMenu);


document
    .getElementById("close-menu-btn")
    .addEventListener("click", closeMenu);


document
    .getElementById("save-btn")
    .addEventListener("click", saveGame);


document
    .getElementById("title-btn")
    .addEventListener("click", quitToTitle);
