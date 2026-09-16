// ==========================================
// GAME CONFIGURATION
// ==========================================

const GAME_CONFIG = {

    player: {
        name: "Hero"
    },

    startingMap: "village"
};


// ==========================================
// DEVELOPMENT SETTINGS
// ==========================================

const DEV_TOOLS_ENABLED = true;


// ==========================================
// WORLD CONSTANTS
// ==========================================

const TILE_SIZE = 32;

const VIEWPORT_WIDTH = 500;
const VIEWPORT_HEIGHT = 350;

const DEFAULT_ATLAS_WIDTH = 2500;
const DEFAULT_ATLAS_HEIGHT = 1750;

const DEFAULT_MAP_WIDTH = DEFAULT_ATLAS_WIDTH;
const DEFAULT_MAP_HEIGHT = DEFAULT_ATLAS_HEIGHT;

const PLAYER_SPRITE_WIDTH = 32;
const PLAYER_SPRITE_HEIGHT = 64;

const PLAYER_COLLISION_WIDTH = PLAYER_SPRITE_WIDTH*1/3;
const PLAYER_COLLISION_HEIGHT = PLAYER_SPRITE_HEIGHT*1/3;

const PLAYER_SPEED = 200;


// ==========================================
// INVENTORY CONSTANTS
// ==========================================

const INVENTORY_SLOTS = 27;

const DEFAULT_ITEM_SYMBOL = "◆";


// ==========================================
// SAVE CONFIGURATION
// ==========================================

const SAVE_KEY = "myRPGSave";


// ==========================================
// DATA CONFIGURATION
// ==========================================

const DATA_FILE = "data.json";


// ==========================================
// GAME DATA
// ==========================================

let gameData = {

    maps: {},

    items: {}
};


let gameDataLoaded = false;


// ==========================================
// CREATE NEW GAME STATE
// ==========================================

function createNewGameState() {

    const mapWidth =
        getInitialMapWidth();

    const mapHeight =
        getInitialMapHeight();


    return {

        player: {

            name: GAME_CONFIG.player.name,

            level: 1,

            xp: 0,

            hp: 100,

            maxHp: 100,

            mp: 20,

            maxMp: 20,

            gold: 50
        },

        /*
            Player position is the center of the
            player's feet in world / atlas
            coordinates.
        */
        position: {

            x: mapWidth / 2,

            y: mapHeight / 2
        },

        /*
            Camera position is also in world
            coordinates.

            It is derived from the player and
            should not be treated as permanent
            gameplay data.
        */
        camera: {

            x: 0,

            y: 0
        },

        currentMap:
            GAME_CONFIG.startingMap,

        inventory: [],

        playTime: 0
    };
}


// ==========================================
// GAME STATE
// ==========================================

let gameState =
    createNewGameState();


// ==========================================
// INPUT STATE
// ==========================================

const keys = {};


// ==========================================
// GAME LOOP VARIABLES
// ==========================================

let lastTime = 0;


// ==========================================
// COLLISION EDITOR STATE
// ==========================================

const collisionEditor = {

    enabled: false,

    drawing: false,

    startX: 0,

    startY: 0,

    currentX: 0,

    currentY: 0,

    selectedIndex: -1
};


// ==========================================
// SCREEN ELEMENTS
// ==========================================

const titleScreen =
    document.getElementById(
        "title-screen"
    );

const gameScreen =
    document.getElementById(
        "game-screen"
    );

const gameMenu =
    document.getElementById(
        "game-menu"
    );

const titleMessage =
    document.getElementById(
        "title-message"
    );

const menuMessage =
    document.getElementById(
        "menu-message"
    );

const mapElement =
    document.getElementById(
        "map"
    );

const mapAtlasElement =
    document.getElementById(
        "map-atlas"
    );

const playerElement =
    document.getElementById(
        "player"
    );

const locationName =
    document.getElementById(
        "location-name"
    );

const inventoryPanel =
    document.getElementById(
        "inventory-panel"
    );

const inventoryGrid =
    document.getElementById(
        "inventory-grid"
    );


// ==========================================
// PLAYER UI ELEMENTS
// ==========================================

const playerName =
    document.getElementById(
        "player-name"
    );

const playerLevel =
    document.getElementById(
        "player-level"
    );

const playerHp =
    document.getElementById(
        "player-hp"
    );

const playerMaxHp =
    document.getElementById(
        "player-max-hp"
    );

const playerMp =
    document.getElementById(
        "player-mp"
    );

const playerMaxMp =
    document.getElementById(
        "player-max-mp"
    );

const playerGold =
    document.getElementById(
        "player-gold"
    );


// ==========================================
// DEV TOOLBOX ELEMENTS
// ==========================================

const devTools =
    document.getElementById(
        "dev-tools"
    );

const devName =
    document.getElementById(
        "dev-name"
    );

const devLevel =
    document.getElementById(
        "dev-level"
    );

const devXp =
    document.getElementById(
        "dev-xp"
    );

const devHp =
    document.getElementById(
        "dev-hp"
    );

const devMaxHp =
    document.getElementById(
        "dev-max-hp"
    );

const devMp =
    document.getElementById(
        "dev-mp"
    );

const devMaxMp =
    document.getElementById(
        "dev-max-mp"
    );

const devGold =
    document.getElementById(
        "dev-gold"
    );

const devX =
    document.getElementById(
        "dev-x"
    );

const devY =
    document.getElementById(
        "dev-y"
    );

const devMap =
    document.getElementById(
        "dev-map"
    );

let devMapDropdown = null;

const devPlayTime =
    document.getElementById(
        "dev-play-time"
    );

const devInventoryList =
    document.getElementById(
        "dev-inventory-list"
    );

const devInventoryItem =
    document.getElementById(
        "dev-inventory-item"
    );

let devInventoryDropdown = null;


// ==========================================
// COLLISION EDITOR ELEMENTS
// ==========================================

let collisionEditorPanel = null;

let collisionEditorToggleButton = null;

let collisionEditorClearButton = null;

let collisionEditorCopyButton = null;

let collisionEditorInfo = null;

let collisionEditorSelection = null;

let collisionEditorList = null;

let collisionEditorLayer = null;

let collisionEditorDrawingElement = null;


// ==========================================
// GET INITIAL MAP WIDTH
// ==========================================

function getInitialMapWidth() {

    const map =
        gameData.maps[
            GAME_CONFIG.startingMap
        ];


    if (
        map &&
        typeof map.width === "number" &&
        Number.isFinite(map.width) &&
        map.width > 0
    ) {

        return map.width;
    }


    return DEFAULT_MAP_WIDTH;
}


// ==========================================
// GET INITIAL MAP HEIGHT
// ==========================================

function getInitialMapHeight() {

    const map =
        gameData.maps[
            GAME_CONFIG.startingMap
        ];


    if (
        map &&
        typeof map.height === "number" &&
        Number.isFinite(map.height) &&
        map.height > 0
    ) {

        return map.height;
    }


    return DEFAULT_MAP_HEIGHT;
}


// ==========================================
// LOAD GAME DATA
// ==========================================

async function loadGameData() {

    try {

        const response =
            await fetch(
                DATA_FILE
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Unable to load game data."
            );
        }


        const loadedData =
            await response.json();


        if (
            !loadedData ||
            typeof loadedData !== "object"
        ) {

            throw new Error(
                "Invalid game data."
            );
        }


        gameData = {

            maps:
                loadedData.maps &&
                typeof loadedData.maps === "object"
                    ? loadedData.maps
                    : {},

            items:
                loadedData.items &&
                typeof loadedData.items === "object"
                    ? loadedData.items
                    : {}
        };


        /*
            Normalize the world-data arrays so
            maps can safely omit any layer.
        */
        Object.keys(
            gameData.maps
        ).forEach(
            function(mapId) {

                const map =
                    gameData.maps[mapId];


                if (
                    !map ||
                    typeof map !== "object"
                ) {

                    return;
                }


                if (
                    !Array.isArray(
                        map.collision
                    )
                ) {

                    map.collision = [];
                }


                if (
                    !Array.isArray(
                        map.triggers
                    )
                ) {

                    map.triggers = [];
                }


                if (
                    !Array.isArray(
                        map.objects
                    )
                ) {

                    map.objects = [];
                }


                if (
                    !Array.isArray(
                        map.transitions
                    )
                ) {

                    map.transitions = [];
                }
            }
        );


        gameDataLoaded = true;


        initializeMapDropdown();

        initializeInventoryItemDropdown();

        initializeCollisionEditor();


        titleMessage.textContent = "";


        document
            .getElementById(
                "new-game-btn"
            )
            .disabled = false;


        document
            .getElementById(
                "load-game-btn"
            )
            .disabled = false;

    }

    catch (error) {

        console.error(
            "Unable to load game data:",
            error
        );


        titleMessage.textContent =
            "Unable to load game data.";
    }
}


// ==========================================
// INITIALIZE DEV TOOLS
// ==========================================

function initializeDevTools() {

    if (
        DEV_TOOLS_ENABLED
    ) {

        return;
    }


    devTools.classList.add(
        "hidden"
    );
}


// ==========================================
// INITIALIZE MAP DROPDOWN
// ==========================================

function initializeMapDropdown() {

    if (
        !DEV_TOOLS_ENABLED ||
        !devMap
    ) {

        return;
    }


    const mapIds =
        Object.keys(
            gameData.maps
        );


    const options =
        mapIds.map(
            function(mapId) {

                const map =
                    gameData.maps[mapId];


                return {

                    value:
                        mapId,

                    label:
                        map &&
                        typeof map.name === "string"
                            ? map.name
                            : mapId
                };
            }
        );


    if (
        devMapDropdown
    ) {

        devMapDropdown.setOptions(
            options
        );

        devMapDropdown.setValue(
            gameState.currentMap
        );

        return;
    }


    devMapDropdown =
        UI.createDropdown({

            element:
                devMap,

            options,

            value:
                gameState.currentMap,

            emptyLabel:
                "No maps available",

            onChange:
                function(mapId) {

                    clearInput();


                    if (
                        !gameData.maps[
                            mapId
                        ]
                    ) {

                        return;
                    }


                    gameState.currentMap =
                        mapId;


                    gameState.position.x =
                        getMapWidth() / 2;


                    gameState.position.y =
                        getMapHeight() / 2;


                    collisionEditor.selectedIndex =
                        -1;


                    updateCamera();

                    updateUI();

                    updateCollisionEditorUI();
                }
        });
}


// ==========================================
// INITIALIZE INVENTORY ITEM DROPDOWN
// ==========================================

function initializeInventoryItemDropdown() {

    if (
        !DEV_TOOLS_ENABLED ||
        !devInventoryItem
    ) {

        return;
    }


    const itemIds =
        Object.keys(
            gameData.items
        );


    const options =
        itemIds.map(
            function(itemId) {

                const item =
                    gameData.items[itemId];


                return {

                    value:
                        itemId,

                    label:
                        item &&
                        typeof item.name === "string"
                            ? item.name
                            : itemId
                };
            }
        );


    if (
        devInventoryDropdown
    ) {

        devInventoryDropdown.setOptions(
            options
        );

        return;
    }


    devInventoryDropdown =
        UI.createDropdown({

            element:
                devInventoryItem,

            options,

            emptyLabel:
                "No items available"
        });
}


// ==========================================
// CLEAR INPUT
// ==========================================

function clearInput() {

    for (const key in keys) {

        keys[key] = false;
    }
}


// ==========================================
// DEV TOOLBOX INPUT PRIORITY
// ==========================================

function isDevToolInteraction(
    target
) {

    if (
        !DEV_TOOLS_ENABLED ||
        !devTools ||
        !target
    ) {

        return false;
    }


    return devTools.contains(
        target
    );
}


// ==========================================
// DEV TOOLBOX POINTER INPUT
// ==========================================

if (
    DEV_TOOLS_ENABLED
) {

    devTools.addEventListener(
        "pointerdown",
        function() {

            clearInput();
        }
    );
}


// ==========================================
// GET CURRENT MAP DATA
// ==========================================

function getCurrentMap() {

    return gameData.maps[
        gameState.currentMap
    ];
}


// ==========================================
// GET MAP WIDTH
// ==========================================

function getMapWidth() {

    const map =
        getCurrentMap();


    if (
        map &&
        typeof map.width === "number" &&
        Number.isFinite(map.width) &&
        map.width > 0
    ) {

        return map.width;
    }


    return DEFAULT_MAP_WIDTH;
}


// ==========================================
// GET MAP HEIGHT
// ==========================================

function getMapHeight() {

    const map =
        getCurrentMap();


    if (
        map &&
        typeof map.height === "number" &&
        Number.isFinite(map.height) &&
        map.height > 0
    ) {

        return map.height;
    }


    return DEFAULT_MAP_HEIGHT;
}


// ==========================================
// GET MAP COLLISION
// ==========================================

function getMapCollision() {

    const map =
        getCurrentMap();


    if (
        !map ||
        !Array.isArray(
            map.collision
        )
    ) {

        return [];
    }


    return map.collision;
}


// ==========================================
// GET CAMERA MAX X
// ==========================================

function getMaxCameraX() {

    return Math.max(
        0,
        getMapWidth() - VIEWPORT_WIDTH
    );
}


// ==========================================
// GET CAMERA MAX Y
// ==========================================

function getMaxCameraY() {

    return Math.max(
        0,
        getMapHeight() - VIEWPORT_HEIGHT
    );
}


// ==========================================
// CLAMP CAMERA
// ==========================================

function clampCamera() {

    gameState.camera.x =
        Math.max(
            0,

            Math.min(
                getMaxCameraX(),
                gameState.camera.x
            )
        );


    gameState.camera.y =
        Math.max(
            0,

            Math.min(
                getMaxCameraY(),
                gameState.camera.y
            )
        );
}


// ==========================================
// UPDATE CAMERA
// ==========================================

function updateCamera() {

    const targetCameraX =
        gameState.position.x -
        VIEWPORT_WIDTH / 2;


    const targetCameraY =
        gameState.position.y -
        VIEWPORT_HEIGHT / 2;


    gameState.camera.x =
        Math.max(
            0,

            Math.min(
                getMaxCameraX(),
                targetCameraX
            )
        );


    gameState.camera.y =
        Math.max(
            0,

            Math.min(
                getMaxCameraY(),
                targetCameraY
            )
        );
}


// ==========================================
// GET PLAYER COLLISION RECTANGLE
// ==========================================

function getPlayerCollisionRect(
    x,
    y
) {

    return {

        left:
            x -
            PLAYER_COLLISION_WIDTH / 2,

        right:
            x +
            PLAYER_COLLISION_WIDTH / 2,

        top:
            y -
            PLAYER_COLLISION_HEIGHT,

        bottom:
            y
    };
}


// ==========================================
// COLLISION RECTANGLE OVERLAP
// ==========================================

function rectanglesOverlap(
    first,
    second
) {

    return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top
    );
}


// ==========================================
// CHECK WORLD COLLISION
// ==========================================

function collidesWithWorld(
    x,
    y
) {

    const playerRect =
        getPlayerCollisionRect(
            x,
            y
        );


    const collisions =
        getMapCollision();


    for (
        let index = 0;
        index < collisions.length;
        index++
    ) {

        const collision =
            collisions[index];


        if (
            !collision ||
            typeof collision !== "object"
        ) {

            continue;
        }


        if (
            !Number.isFinite(
                collision.x
            ) ||
            !Number.isFinite(
                collision.y
            ) ||
            !Number.isFinite(
                collision.width
            ) ||
            !Number.isFinite(
                collision.height
            )
        ) {

            continue;
        }


        if (
            collision.width <= 0 ||
            collision.height <= 0
        ) {

            continue;
        }


        const collisionRect = {

            left:
                collision.x,

            right:
                collision.x +
                collision.width,

            top:
                collision.y,

            bottom:
                collision.y +
                collision.height
        };


        if (
            rectanglesOverlap(
                playerRect,
                collisionRect
            )
        ) {

            return true;
        }
    }


    return false;
}


// ==========================================
// CLAMP PLAYER POSITION
// ==========================================

function clampPlayerPosition() {

    const halfWidth =
        PLAYER_COLLISION_WIDTH / 2;

    const collisionHeight =
        PLAYER_COLLISION_HEIGHT;


    const mapWidth =
        getMapWidth();

    const mapHeight =
        getMapHeight();


    gameState.position.x =
        Math.max(
            halfWidth,

            Math.min(
                mapWidth - halfWidth,
                gameState.position.x
            )
        );


    gameState.position.y =
        Math.max(
            collisionHeight,

            Math.min(
                mapHeight,
                gameState.position.y
            )
        );


    updateCamera();
}


// ==========================================
// RENDER MAP ATLAS
// ==========================================

function updateMapAtlasUI() {

    const mapWidth =
        getMapWidth();

    const mapHeight =
        getMapHeight();


    mapAtlasElement.style.width =
        mapWidth + "px";

    mapAtlasElement.style.height =
        mapHeight + "px";


    const map =
        getCurrentMap();


    /*
        The atlas is visual-only world data.

        Its dimensions are explicitly scaled to
        the dimensions declared in data.json so
        atlas pixels and world coordinates remain
        aligned.
    */

    if (
        map &&
        typeof map.atlas === "string" &&
        map.atlas.trim() !== ""
    ) {

        mapAtlasElement.style.backgroundImage =
            "url('" +
            map.atlas.replace(
                /'/g,
                "\\'"
            ) +
            "')";

        mapAtlasElement.style.backgroundSize =
            mapWidth +
            "px " +
            mapHeight +
            "px";

        mapAtlasElement.style.backgroundPosition =
            "top left";

        mapAtlasElement.style.backgroundRepeat =
            "no-repeat";
    }

    else {

        mapAtlasElement.style.backgroundImage =
            "none";
    }


    mapAtlasElement.style.transform =
        "translate3d(" +
        (-gameState.camera.x) +
        "px, " +
        (-gameState.camera.y) +
        "px, 0)";
}


// ==========================================
// UPDATE PLAYER POSITION UI
// ==========================================

function updatePlayerPositionUI() {

    playerElement.style.left =
        gameState.position.x + "px";

    playerElement.style.top =
        gameState.position.y + "px";


    playerElement.style.width =
        PLAYER_SPRITE_WIDTH + "px";

    playerElement.style.height =
        PLAYER_SPRITE_HEIGHT + "px";


    if (
        DEV_TOOLS_ENABLED
    ) {

        devX.textContent =
            Math.round(
                gameState.position.x
            );

        devY.textContent =
            Math.round(
                gameState.position.y
            );
    }
}


// ==========================================
// UPDATE CAMERA + MAP UI
// ==========================================

function updateCameraUI() {

    updateCamera();

    updateMapAtlasUI();

    updateCollisionEditorOverlay();
}


// ==========================================
// UPDATE PLAYER STATS UI
// ==========================================

function updatePlayerStatsUI() {

    playerName.textContent =
        gameState.player.name;

    playerLevel.textContent =
        gameState.player.level;

    playerHp.textContent =
        gameState.player.hp;

    playerMaxHp.textContent =
        gameState.player.maxHp;

    playerMp.textContent =
        gameState.player.mp;

    playerMaxMp.textContent =
        gameState.player.maxMp;

    playerGold.textContent =
        gameState.player.gold;
}


// ==========================================
// UPDATE LOCATION UI
// ==========================================

function updateLocationUI() {

    locationName.textContent =
        getLocationName(
            gameState.currentMap
        );
}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    clampPlayerPosition();

    updateCameraUI();

    updatePlayerStatsUI();

    updatePlayerPositionUI();

    updateLocationUI();

    updateInventory();


    if (
        DEV_TOOLS_ENABLED
    ) {

        updateDevTools();
    }


    updateCollisionEditorUI();
}


// ==========================================
// UPDATE INVENTORY
// ==========================================

function updateInventory() {

    inventoryGrid.innerHTML = "";


    for (
        let index = 0;
        index < INVENTORY_SLOTS;
        index++
    ) {

        const slot =
            document.createElement(
                "div"
            );


        slot.className =
            "inventory-slot";


        const item =
            gameState.inventory[index];


        if (
            item
        ) {

            const normalizedItem =
                normalizeInventoryItem(
                    item
                );


            if (
                normalizedItem
            ) {

                const symbol =
                    document.createElement(
                        "span"
                    );


                symbol.textContent =
                    normalizedItem.symbol;


                slot.title =
                    normalizedItem.name;


                slot.appendChild(
                    symbol
                );
            }

            else {

                slot.classList.add(
                    "empty"
                );
            }
        }

        else {

            slot.classList.add(
                "empty"
            );
        }


        inventoryGrid.appendChild(
            slot
        );
    }
}


// ==========================================
// OPEN INVENTORY
// ==========================================

function openInventory() {

    if (
        gameScreen.classList.contains(
            "hidden"
        ) ||
        !gameMenu.classList.contains(
            "hidden"
        )
    ) {

        return;
    }


    inventoryPanel.classList.remove(
        "hidden"
    );


    updateInventory();
}


// ==========================================
// CLOSE INVENTORY
// ==========================================

function closeInventory() {

    inventoryPanel.classList.add(
        "hidden"
    );
}


// ==========================================
// TOGGLE INVENTORY
// ==========================================

function toggleInventory() {

    if (
        inventoryPanel.classList.contains(
            "hidden"
        )
    ) {

        openInventory();
    }

    else {

        closeInventory();
    }
}


// ==========================================
// UPDATE DEV TOOLBOX
// ==========================================

function updateDevTools() {

    devName.value =
        gameState.player.name;

    devLevel.textContent =
        gameState.player.level;

    devXp.textContent =
        gameState.player.xp;

    devHp.textContent =
        gameState.player.hp;

    devMaxHp.textContent =
        gameState.player.maxHp;

    devMp.textContent =
        gameState.player.mp;

    devMaxMp.textContent =
        gameState.player.maxMp;

    devGold.textContent =
        gameState.player.gold;


    if (
        devMapDropdown &&
        gameData.maps[
            gameState.currentMap
        ]
    ) {

        devMapDropdown.setValue(
            gameState.currentMap
        );
    }


    devPlayTime.textContent =
        Math.floor(
            gameState.playTime
        );


    updateDevInventory();
}


// ==========================================
// UPDATE DEV INVENTORY
// ==========================================

function updateDevInventory() {

    devInventoryList.innerHTML = "";


    if (
        gameState.inventory.length === 0
    ) {

        devInventoryList.textContent =
            "Empty";

        return;
    }


    gameState.inventory.forEach(
        function(item, index) {

            const normalizedItem =
                normalizeInventoryItem(
                    item
                );


            if (
                !normalizedItem
            ) {

                return;
            }


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "dev-inventory-item";


            const itemName =
                document.createElement(
                    "span"
                );


            itemName.textContent =
                normalizedItem.name;


            itemName.title =
                normalizedItem.name;


            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";

            removeButton.textContent =
                "×";


            removeButton.title =
                "Remove item";


            removeButton.addEventListener(
                "click",
                function() {

                    clearInput();

                    gameState.inventory.splice(
                        index,
                        1
                    );

                    updateUI();
                }
            );


            row.appendChild(
                itemName
            );

            row.appendChild(
                removeButton
            );


            devInventoryList.appendChild(
                row
            );
        }
    );
}


// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    try {

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify({

                ...gameState,

                inventory:
                    gameState.inventory
                        .slice(
                            0,
                            INVENTORY_SLOTS
                        )
                        .map(
                            getInventoryItemId
                        )
                        .filter(
                            function(itemId) {

                                return (
                                    itemId !== null
                                );
                            }
                        )
            })
        );


        menuMessage.textContent =
            "Game saved!";
    }

    catch (error) {

        console.error(
            "Unable to save game:",
            error
        );


        menuMessage.textContent =
            "Unable to save game.";
    }
}


// ==========================================
// VALIDATE LOADED GAME
// ==========================================

function validateLoadedGame(
    savedState
) {

    if (
        !savedState ||
        typeof savedState !== "object"
    ) {

        return false;
    }


    if (
        !savedState.player ||
        typeof savedState.player !== "object"
    ) {

        return false;
    }


    if (
        !savedState.position ||
        typeof savedState.position !== "object"
    ) {

        return false;
    }


    if (
        !Number.isFinite(
            savedState.position.x
        ) ||
        !Number.isFinite(
            savedState.position.y
        )
    ) {

        return false;
    }


    if (
        typeof savedState.player.name !== "string" ||
        !Number.isFinite(savedState.player.level) ||
        !Number.isFinite(savedState.player.xp) ||
        !Number.isFinite(savedState.player.hp) ||
        !Number.isFinite(savedState.player.maxHp) ||
        !Number.isFinite(savedState.player.mp) ||
        !Number.isFinite(savedState.player.maxMp) ||
        !Number.isFinite(savedState.player.gold)
    ) {

        return false;
    }


    if (
        savedState.playTime !== undefined &&
        !Number.isFinite(
            savedState.playTime
        )
    ) {

        return false;
    }


    return true;
}


// ==========================================
// LOAD GAME
// ==========================================

function loadGame() {

    if (
        !gameDataLoaded
    ) {

        return;
    }


    const savedGame =
        localStorage.getItem(
            SAVE_KEY
        );


    if (!savedGame) {

        titleMessage.textContent =
            "No save file found.";

        return;
    }


    try {

        const parsedGame =
            JSON.parse(savedGame);


        if (
            !validateLoadedGame(
                parsedGame
            )
        ) {

            throw new Error(
                "Invalid save data."
            );
        }


        const defaultState =
            createNewGameState();


        gameState = {

            ...defaultState,

            ...parsedGame,

            player: {

                ...defaultState.player,

                ...parsedGame.player
            },

            position: {

                ...defaultState.position,

                ...parsedGame.position
            },

            camera: {

                ...defaultState.camera,

                ...parsedGame.camera
            },

            inventory:
                normalizeInventory(
                    parsedGame.inventory
                ),

            playTime:
                Number.isFinite(
                    parsedGame.playTime
                )
                    ? Math.max(
                        0,
                        parsedGame.playTime
                    )
                    : defaultState.playTime
        };


        if (
            !gameData.maps[
                gameState.currentMap
            ]
        ) {

            if (
                gameData.maps[
                    GAME_CONFIG.startingMap
                ]
            ) {

                gameState.currentMap =
                    GAME_CONFIG.startingMap;
            }

            else {

                const firstMapId =
                    Object.keys(
                        gameData.maps
                    )[0];


                if (
                    firstMapId
                ) {

                    gameState.currentMap =
                        firstMapId;
                }
            }
        }


        clampPlayerPosition();

        closeInventory();

        showGame();
    }

    catch (error) {

        console.error(
            "Save file is corrupted:",
            error
        );


        titleMessage.textContent =
            "Unable to load save.";
    }
}


// ==========================================
// GET LOCATION NAME
// ==========================================

function getLocationName(
    mapId
) {

    const map =
        gameData.maps[mapId];


    if (
        map &&
        typeof map.name === "string" &&
        map.name.trim() !== ""
    ) {

        return map.name;
    }


    if (
        typeof mapId !== "string" ||
        mapId.trim() === ""
    ) {

        return "Unknown Location";
    }


    return mapId
        .split("_")
        .map(
            function(word) {

                return (
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
                );
            }
        )
        .join(" ");
}


// ==========================================
// GET ITEM DATA
// ==========================================

function getItemData(
    itemId
) {

    if (
        typeof itemId !== "string"
    ) {

        return null;
    }


    return gameData.items[
        itemId
    ] || null;
}


// ==========================================
// NORMALIZE INVENTORY ITEM
// ==========================================

function normalizeInventoryItem(
    item
) {

    let itemId = null;


    if (
        typeof item === "string"
    ) {

        itemId =
            item;
    }

    else if (
        item &&
        typeof item === "object"
    ) {

        if (
            typeof item.id === "string"
        ) {

            itemId =
                item.id;
        }
    }


    if (
        !itemId
    ) {

        return null;
    }


    const itemData =
        getItemData(
            itemId
        );


    if (
        itemData
    ) {

        return {

            id:
                itemId,

            name:
                typeof itemData.name === "string"
                    ? itemData.name
                    : itemId,

            symbol:
                typeof itemData.symbol === "string" &&
                itemData.symbol !== ""
                    ? itemData.symbol
                    : DEFAULT_ITEM_SYMBOL
        };
    }


    if (
        item &&
        typeof item === "object" &&
        typeof item.name === "string"
    ) {

        return {

            id:
                itemId,

            name:
                item.name,

            symbol:
                typeof item.symbol === "string" &&
                item.symbol !== ""
                    ? item.symbol
                    : DEFAULT_ITEM_SYMBOL
        };
    }


    return {

        id:
            itemId,

        name:
            itemId,

        symbol:
            DEFAULT_ITEM_SYMBOL
    };
}


// ==========================================
// NORMALIZE INVENTORY
// ==========================================

function normalizeInventory(
    inventory
) {

    if (
        !Array.isArray(inventory)
    ) {

        return [];
    }


    return inventory
        .slice(
            0,
            INVENTORY_SLOTS
        )
        .map(
            normalizeInventoryItem
        )
        .filter(
            function(item) {

                return item !== null;
            }
        );
}


// ==========================================
// GET ITEM ID
// ==========================================

function getInventoryItemId(
    item
) {

    if (
        typeof item === "string"
    ) {

        return item;
    }


    if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string"
    ) {

        return item.id;
    }


    return null;
}


// ==========================================
// SHOW GAME
// ==========================================

function showGame() {

    titleMessage.textContent = "";

    titleScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );

    updateUI();
}


// ==========================================
// NEW GAME
// ==========================================

function newGame() {

    if (
        !gameDataLoaded
    ) {

        return;
    }


    clearInput();

    gameState =
        createNewGameState();


    if (
        !gameData.maps[
            gameState.currentMap
        ]
    ) {

        const firstMapId =
            Object.keys(
                gameData.maps
            )[0];


        if (
            firstMapId
        ) {

            gameState.currentMap =
                firstMapId;


            gameState.position.x =
                getMapWidth() / 2;


            gameState.position.y =
                getMapHeight() / 2;
        }
    }


    collisionEditor.selectedIndex =
        -1;


    closeInventory();

    clampPlayerPosition();

    showGame();
}


// ==========================================
// OPEN GAME MENU
// ==========================================

function openMenu() {

    clearInput();

    closeInventory();

    gameMenu.classList.remove(
        "hidden"
    );

    menuMessage.textContent = "";
}


// ==========================================
// CLOSE GAME MENU
// ==========================================

function closeMenu() {

    clearInput();

    gameMenu.classList.add(
        "hidden"
    );
}


// ==========================================
// QUIT TO TITLE
// ==========================================

function quitToTitle() {

    clearInput();

    closeInventory();

    gameMenu.classList.add(
        "hidden"
    );

    gameScreen.classList.add(
        "hidden"
    );

    titleScreen.classList.remove(
        "hidden"
    );

    titleMessage.textContent = "";
}


// ==========================================
// KEY DOWN
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            gameScreen.classList.contains(
                "hidden"
            )
        ) {

            return;
        }


        if (
            isDevToolInteraction(
                event.target
            )
        ) {

            clearInput();

            return;
        }


        if (
            collisionEditor.enabled &&
            (
                event.key === "Delete" ||
                event.key === "Backspace"
            )
        ) {

            event.preventDefault();

            deleteSelectedCollision();

            return;
        }


        if (
            collisionEditor.enabled &&
            event.key === "Escape"
        ) {

            if (
                collisionEditor.drawing
            ) {

                cancelCollisionDrawing();

                return;
            }


            collisionEditor.selectedIndex =
                -1;

            updateCollisionEditorUI();

            return;
        }


        const key =
            event.key.toLowerCase();


        if (
            key === "e"
        ) {

            event.preventDefault();

            toggleInventory();

            return;
        }


        keys[key] = true;


        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright"
            ].includes(key)
        ) {

            event.preventDefault();
        }
    }
);


// ==========================================
// KEY UP
// ==========================================

document.addEventListener(
    "keyup",
    function(event) {

        if (
            isDevToolInteraction(
                event.target
            )
        ) {

            clearInput();

            return;
        }


        const key =
            event.key.toLowerCase();


        keys[key] = false;
    }
);


// ==========================================
// WINDOW BLUR
// ==========================================

window.addEventListener(
    "blur",
    function() {

        clearInput();
    }
);


// ==========================================
// TRY MOVE PLAYER
// ==========================================

function tryMovePlayer(
    dx,
    dy
) {

    const nextX =
        gameState.position.x +
        dx;

    const nextY =
        gameState.position.y +
        dy;


    /*
        Test horizontal and vertical movement
        independently.

        This allows the player to slide along
        the side of a collision rectangle
        instead of getting completely stuck.
    */

    if (
        !collidesWithWorld(
            nextX,
            gameState.position.y
        )
    ) {

        gameState.position.x =
            nextX;
    }


    if (
        !collidesWithWorld(
            gameState.position.x,
            nextY
        )
    ) {

        gameState.position.y =
            nextY;
    }


    clampPlayerPosition();
}


// ==========================================
// UPDATE MOVEMENT
// ==========================================

function updateMovement(
    deltaTime
) {

    if (
        gameScreen.classList.contains(
            "hidden"
        ) ||
        !gameMenu.classList.contains(
            "hidden"
        ) ||
        !inventoryPanel.classList.contains(
            "hidden"
        ) ||
        collisionEditor.enabled
    ) {

        return;
    }


    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy -= 1;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy += 1;
    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx -= 1;
    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx += 1;
    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /= length;
        dy /= length;


        tryMovePlayer(
            dx *
            PLAYER_SPEED *
            deltaTime,

            dy *
            PLAYER_SPEED *
            deltaTime
        );


        gameState.playTime +=
            deltaTime;


        updateCameraUI();

        updatePlayerPositionUI();
    }
}


// ==========================================
// DEV TOOLBOX
// ==========================================

const DEV_STEP = 1;


// ==========================================
// MODIFY DEV VALUE
// ==========================================

function modifyDevValue(
    target,
    amount
) {

    switch (target) {

        case "level":

            gameState.player.level +=
                amount;

            gameState.player.level =
                Math.max(
                    1,
                    gameState.player.level
                );

            break;


        case "xp":

            gameState.player.xp +=
                amount;

            gameState.player.xp =
                Math.max(
                    0,
                    gameState.player.xp
                );

            break;


        case "hp":

            gameState.player.hp +=
                amount;

            gameState.player.hp =
                Math.max(
                    0,
                    gameState.player.hp
                );

            break;


        case "maxHp":

            gameState.player.maxHp +=
                amount;

            gameState.player.maxHp =
                Math.max(
                    1,
                    gameState.player.maxHp
                );

            break;


        case "mp":

            gameState.player.mp +=
                amount;

            gameState.player.mp =
                Math.max(
                    0,
                    gameState.player.mp
                );

            break;


        case "maxMp":

            gameState.player.maxMp +=
                amount;

            gameState.player.maxMp =
                Math.max(
                    1,
                    gameState.player.maxMp
                );

            break;


        case "gold":

            gameState.player.gold +=
                amount;

            gameState.player.gold =
                Math.max(
                    0,
                    gameState.player.gold
                );

            break;


        case "x":

            gameState.position.x +=
                amount;

            break;


        case "y":

            gameState.position.y +=
                amount;

            break;


        case "playTime":

            gameState.playTime +=
                amount;

            gameState.playTime =
                Math.max(
                    0,
                    gameState.playTime
                );

            break;
    }


    clampPlayerPosition();

    updateUI();
}


// ==========================================
// DEV NAME
// ==========================================

if (
    DEV_TOOLS_ENABLED
) {

    devName.addEventListener(
        "change",
        function() {

            clearInput();

            gameState.player.name =
                devName.value;

            updateUI();
        }
    );
}


// ==========================================
// DEV NUMBER BUTTONS
// ==========================================

if (
    DEV_TOOLS_ENABLED
) {

    document
        .querySelectorAll(
            "[data-dev-action]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        clearInput();


                        const action =
                            button.dataset.devAction;


                        const target =
                            button.dataset.devTarget;


                        const amount =
                            action === "add"
                                ? DEV_STEP
                                : -DEV_STEP;


                        modifyDevValue(
                            target,
                            amount
                        );
                    }
                );
            }
        );
}


// ==========================================
// DEV ADD INVENTORY ITEM
// ==========================================

if (
    DEV_TOOLS_ENABLED
) {

    document
        .getElementById(
            "dev-add-item-btn"
        )
        .addEventListener(
            "click",
            function() {

                clearInput();


                if (
                    !devInventoryDropdown ||
                    gameState.inventory.length >= INVENTORY_SLOTS
                ) {

                    return;
                }


                const itemId =
                    devInventoryDropdown.getValue();


                if (
                    !itemId ||
                    !gameData.items[itemId]
                ) {

                    return;
                }


                gameState.inventory.push(
                    itemId
                );


                updateUI();
            }
        );
}


// ==========================================
// DEV RESET GAME STATE
// ==========================================

if (
    DEV_TOOLS_ENABLED
) {

    document
        .getElementById(
            "dev-reset-btn"
        )
        .addEventListener(
            "click",
            function() {

                clearInput();


                const confirmed =
                    confirm(
                        "Reset the current game state?"
                    );


                if (!confirmed) {

                    return;
                }


                gameState =
                    createNewGameState();


                if (
                    !gameData.maps[
                        gameState.currentMap
                    ]
                ) {

                    const firstMapId =
                        Object.keys(
                            gameData.maps
                        )[0];


                    if (
                        firstMapId
                    ) {

                        gameState.currentMap =
                            firstMapId;
                    }
                }


                collisionEditor.selectedIndex =
                    -1;


                closeInventory();

                clampPlayerPosition();

                updateUI();
            }
        );
}


// ==========================================
// CREATE COLLISION EDITOR
// ==========================================

function initializeCollisionEditor() {

    if (
        !DEV_TOOLS_ENABLED ||
        !devTools
    ) {

        return;
    }


    if (
        collisionEditorPanel
    ) {

        return;
    }


    /*
        The editor is created dynamically so
        index.html does not need another large
        block of developer-only markup.
    */

    collisionEditorPanel =
        document.createElement(
            "div"
        );


    collisionEditorPanel.className =
        "dev-section dev-collision-editor";


    collisionEditorPanel.innerHTML = `
        <h3>Collision Editor</h3>

        <div class="dev-collision-editor-controls">

            <button
                type="button"
                id="dev-collision-toggle"
            >
                Edit Collision
            </button>

            <button
                type="button"
                id="dev-collision-clear"
            >
                Clear All
            </button>

            <button
                type="button"
                id="dev-collision-copy"
            >
                Copy JSON
            </button>

        </div>

        <div
            id="dev-collision-info"
            class="dev-collision-info"
        >
            Enable editing, then drag on the atlas
            to create collision rectangles.
        </div>

        <div
            id="dev-collision-selection"
            class="dev-collision-selection"
        ></div>

        <div
            id="dev-collision-list"
            class="dev-collision-list"
        ></div>
    `;


    devTools.insertBefore(
        collisionEditorPanel,
        devTools.lastElementChild
    );


    collisionEditorToggleButton =
        document.getElementById(
            "dev-collision-toggle"
        );


    collisionEditorClearButton =
        document.getElementById(
            "dev-collision-clear"
        );


    collisionEditorCopyButton =
        document.getElementById(
            "dev-collision-copy"
        );


    collisionEditorInfo =
        document.getElementById(
            "dev-collision-info"
        );


    collisionEditorSelection =
        document.getElementById(
            "dev-collision-selection"
        );


    collisionEditorList =
        document.getElementById(
            "dev-collision-list"
        );


    collisionEditorToggleButton.addEventListener(
        "click",
        function() {

            clearInput();

            collisionEditor.enabled =
                !collisionEditor.enabled;


            collisionEditor.drawing =
                false;

            collisionEditor.selectedIndex =
                -1;


            updateCollisionEditorUI();
        }
    );


    collisionEditorClearButton.addEventListener(
        "click",
        function() {

            clearInput();


            const collisions =
                getMapCollision();


            if (
                collisions.length === 0
            ) {

                return;
            }


            const confirmed =
                confirm(
                    "Clear all collision rectangles from this map?"
                );


            if (!confirmed) {

                return;
            }


            collisions.length =
                0;


            collisionEditor.selectedIndex =
                -1;


            updateCollisionEditorUI();
        }
    );


    collisionEditorCopyButton.addEventListener(
        "click",
        function() {

            clearInput();

            copyCollisionJSON();
        }
    );


    createCollisionEditorLayer();

    initializeCollisionEditorPointerEvents();

    updateCollisionEditorUI();
}


// ==========================================
// CREATE COLLISION EDITOR LAYER
// ==========================================

function createCollisionEditorLayer() {

    collisionEditorLayer =
        document.createElement(
            "div"
        );


    collisionEditorLayer.id =
        "collision-editor-layer";


    mapAtlasElement.appendChild(
        collisionEditorLayer
    );


    collisionEditorDrawingElement =
        document.createElement(
            "div"
        );


    collisionEditorDrawingElement.className =
        "collision-editor-drawing";


    collisionEditorDrawingElement.classList.add(
        "hidden"
    );


    collisionEditorLayer.appendChild(
        collisionEditorDrawingElement
    );
}


// ==========================================
// GET MAP POINTER POSITION
// ==========================================

function getMapPointerWorldPosition(
    event
) {

    const rect =
        mapElement.getBoundingClientRect();


    const borderLeft =
        mapElement.clientLeft;


    const borderTop =
        mapElement.clientTop;


    const viewportX =
        event.clientX -
        rect.left -
        borderLeft;


    const viewportY =
        event.clientY -
        rect.top -
        borderTop;


    return {

        x:
            gameState.camera.x +
            viewportX,

        y:
            gameState.camera.y +
            viewportY
    };
}


// ==========================================
// CLAMP EDITOR COORDINATE
// ==========================================

function clampEditorCoordinate(
    value,
    maximum
) {

    return Math.max(
        0,
        Math.min(
            maximum,
            value
        )
    );
}


// ==========================================
// NORMALIZE DRAW RECTANGLE
// ==========================================

function normalizeDrawRectangle() {

    const left =
        Math.min(
            collisionEditor.startX,
            collisionEditor.currentX
        );


    const top =
        Math.min(
            collisionEditor.startY,
            collisionEditor.currentY
        );


    const right =
        Math.max(
            collisionEditor.startX,
            collisionEditor.currentX
        );


    const bottom =
        Math.max(
            collisionEditor.startY,
            collisionEditor.currentY
        );


    return {

        x:
            left,

        y:
            top,

        width:
            right - left,

        height:
            bottom - top
    };
}


// ==========================================
// START COLLISION DRAW
// ==========================================

function startCollisionDrawing(
    event
) {

    if (
        !collisionEditor.enabled
    ) {

        return;
    }


    if (
        event.button !== 0
    ) {

        return;
    }


    event.preventDefault();


    clearInput();


    const position =
        getMapPointerWorldPosition(
            event
        );


    collisionEditor.drawing =
        true;


    collisionEditor.startX =
        clampEditorCoordinate(
            position.x,
            getMapWidth()
        );


    collisionEditor.startY =
        clampEditorCoordinate(
            position.y,
            getMapHeight()
        );


    collisionEditor.currentX =
        collisionEditor.startX;


    collisionEditor.currentY =
        collisionEditor.startY;


    collisionEditor.selectedIndex =
        -1;


    mapElement.setPointerCapture(
        event.pointerId
    );


    updateCollisionEditorDrawing();

    updateCollisionEditorUI();
}


// ==========================================
// UPDATE COLLISION DRAW
// ==========================================

function updateCollisionDrawing(
    event
) {

    if (
        !collisionEditor.drawing
    ) {

        return;
    }


    const position =
        getMapPointerWorldPosition(
            event
        );


    collisionEditor.currentX =
        clampEditorCoordinate(
            position.x,
            getMapWidth()
        );


    collisionEditor.currentY =
        clampEditorCoordinate(
            position.y,
            getMapHeight()
        );


    updateCollisionEditorDrawing();
}


// ==========================================
// FINISH COLLISION DRAW
// ==========================================

function finishCollisionDrawing(
    event
) {

    if (
        !collisionEditor.drawing
    ) {

        return;
    }


    if (
        mapElement.hasPointerCapture(
            event.pointerId
        )
    ) {

        mapElement.releasePointerCapture(
            event.pointerId
        );
    }


    const rectangle =
        normalizeDrawRectangle();


    collisionEditor.drawing =
        false;


    collisionEditorDrawingElement.classList.add(
        "hidden"
    );


    /*
        Ignore accidental clicks smaller than
        one world pixel.
    */
    if (
        rectangle.width < 1 ||
        rectangle.height < 1
    ) {

        updateCollisionEditorUI();

        return;
    }


    const collisions =
        getMapCollision();


    collisions.push(
        {

            x:
                Math.round(
                    rectangle.x
                ),

            y:
                Math.round(
                    rectangle.y
                ),

            width:
                Math.round(
                    rectangle.width
                ),

            height:
                Math.round(
                    rectangle.height
                )
        }
    );


    collisionEditor.selectedIndex =
        collisions.length - 1;


    updateCollisionEditorUI();
}


// ==========================================
// CANCEL COLLISION DRAWING
// ==========================================

function cancelCollisionDrawing() {

    collisionEditor.drawing =
        false;


    collisionEditorDrawingElement.classList.add(
        "hidden"
    );


    collisionEditor.selectedIndex =
        -1;


    updateCollisionEditorUI();
}


// ==========================================
// UPDATE COLLISION DRAWING VISUAL
// ==========================================

function updateCollisionEditorDrawing() {

    if (
        !collisionEditor.drawing ||
        !collisionEditorDrawingElement
    ) {

        return;
    }


    const rectangle =
        normalizeDrawRectangle();


    collisionEditorDrawingElement.style.left =
        rectangle.x + "px";


    collisionEditorDrawingElement.style.top =
        rectangle.y + "px";


    collisionEditorDrawingElement.style.width =
        rectangle.width + "px";


    collisionEditorDrawingElement.style.height =
        rectangle.height + "px";


    collisionEditorDrawingElement.classList.remove(
        "hidden"
    );
}


// ==========================================
// MAP POINTER EVENTS
// ==========================================

function initializeCollisionEditorPointerEvents() {

    mapElement.addEventListener(
        "pointerdown",
        startCollisionDrawing
    );


    mapElement.addEventListener(
        "pointermove",
        updateCollisionDrawing
    );


    mapElement.addEventListener(
        "pointerup",
        finishCollisionDrawing
    );


    mapElement.addEventListener(
        "pointercancel",
        cancelCollisionDrawing
    );
}


// ==========================================
// RENDER COLLISION RECTANGLES
// ==========================================

function updateCollisionEditorOverlay() {

    if (
        !collisionEditorLayer
    ) {

        return;
    }


    collisionEditorLayer.innerHTML = "";


    if (
        !collisionEditor.enabled
    ) {

        return;
    }


    const collisions =
        getMapCollision();


    collisions.forEach(
        function(
            collision,
            index
        ) {

            if (
                !collision ||
                typeof collision !== "object"
            ) {

                return;
            }


            const rectangle =
                document.createElement(
                    "div"
                );


            rectangle.className =
                "collision-editor-rectangle";


            if (
                index ===
                collisionEditor.selectedIndex
            ) {

                rectangle.classList.add(
                    "selected"
                );
            }


            rectangle.style.left =
                collision.x + "px";


            rectangle.style.top =
                collision.y + "px";


            rectangle.style.width =
                collision.width + "px";


            rectangle.style.height =
                collision.height + "px";


            collisionEditorLayer.appendChild(
                rectangle
            );
        }
    );


    /*
        The drawing element is separate because
        updateCollisionEditorOverlay clears the
        layer.
    */

    collisionEditorLayer.appendChild(
        collisionEditorDrawingElement
    );


    updateCollisionEditorDrawing();
}


// ==========================================
// UPDATE COLLISION EDITOR LIST
// ==========================================

function updateCollisionEditorList() {

    if (
        !collisionEditorList
    ) {

        return;
    }


    collisionEditorList.innerHTML = "";


    const collisions =
        getMapCollision();


    if (
        collisions.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "dev-collision-empty";


        empty.textContent =
            "No collision rectangles.";


        collisionEditorList.appendChild(
            empty
        );


        return;
    }


    collisions.forEach(
        function(
            collision,
            index
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "dev-collision-item";


            if (
                index ===
                collisionEditor.selectedIndex
            ) {

                row.classList.add(
                    "selected"
                );
            }


            row.addEventListener(
                "click",
                function() {

                    clearInput();

                    collisionEditor.selectedIndex =
                        index;

                    updateCollisionEditorUI();
                }
            );


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                "#" +
                (index + 1) +
                "  x:" +
                collision.x +
                " y:" +
                collision.y +
                " w:" +
                collision.width +
                " h:" +
                collision.height;


            text.title =
                text.textContent;


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Delete collision";


            deleteButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    clearInput();

                    deleteCollision(
                        index
                    );
                }
            );


            row.appendChild(
                text
            );

            row.appendChild(
                deleteButton
            );


            collisionEditorList.appendChild(
                row
            );
        }
    );
}


// ==========================================
// UPDATE COLLISION EDITOR UI
// ==========================================

function updateCollisionEditorUI() {

    if (
        !collisionEditorPanel
    ) {

        return;
    }


    collisionEditorToggleButton.textContent =
        collisionEditor.enabled
            ? "Stop Editing"
            : "Edit Collision";


    collisionEditorToggleButton.classList.toggle(
        "active",
        collisionEditor.enabled
    );


    collisionEditorInfo.textContent =
        collisionEditor.enabled
            ? "Drag on the atlas to draw a solid rectangle. Delete removes the selected rectangle."
            : "Enable editing, then drag on the atlas to create collision rectangles.";


    const collisions =
        getMapCollision();


    if (
        collisionEditor.selectedIndex >= 0 &&
        collisions[
            collisionEditor.selectedIndex
        ]
    ) {

        const collision =
            collisions[
                collisionEditor.selectedIndex
            ];


        collisionEditorSelection.textContent =
            "Selected: x " +
            collision.x +
            " | y " +
            collision.y +
            " | w " +
            collision.width +
            " | h " +
            collision.height;
    }

    else {

        collisionEditorSelection.textContent =
            "";
    }


    collisionEditorClearButton.disabled =
        collisions.length === 0;


    collisionEditorCopyButton.disabled =
        collisions.length === 0;


    updateCollisionEditorList();

    updateCollisionEditorOverlay();
}


// ==========================================
// DELETE COLLISION
// ==========================================

function deleteCollision(
    index
) {

    const collisions =
        getMapCollision();


    if (
        index < 0 ||
        index >= collisions.length
    ) {

        return;
    }


    collisions.splice(
        index,
        1
    );


    if (
        collisionEditor.selectedIndex ===
        index
    ) {

        collisionEditor.selectedIndex =
            -1;
    }

    else if (
        collisionEditor.selectedIndex >
        index
    ) {

        collisionEditor.selectedIndex -=
            1;
    }


    updateCollisionEditorUI();
}


// ==========================================
// DELETE SELECTED COLLISION
// ==========================================

function deleteSelectedCollision() {

    if (
        collisionEditor.selectedIndex < 0
    ) {

        return;
    }


    deleteCollision(
        collisionEditor.selectedIndex
    );
}


// ==========================================
// GET COLLISION JSON
// ==========================================

function getCollisionJSON() {

    const collisions =
        getMapCollision();


    return JSON.stringify(
        collisions.map(
            function(collision) {

                return {

                    x:
                        Math.round(
                            collision.x
                        ),

                    y:
                        Math.round(
                            collision.y
                        ),

                    width:
                        Math.round(
                            collision.width
                        ),

                    height:
                        Math.round(
                            collision.height
                        )
                };
            }
        ),
        null,
        4
    );
}


// ==========================================
// COPY COLLISION JSON
// ==========================================

async function copyCollisionJSON() {

    const json =
        getCollisionJSON();


    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                json
            );

            collisionEditorInfo.textContent =
                "Collision JSON copied to clipboard.";

            return;
        }

    }

    catch (error) {

        console.warn(
            "Clipboard API unavailable:",
            error
        );
    }


    /*
        Fallback for environments where the
        Clipboard API is unavailable.
    */

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        json;


    textarea.style.position =
        "fixed";


    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    let copied =
        false;


    try {

        copied =
            document.execCommand(
                "copy"
            );
    }

    catch (error) {

        console.warn(
            "Unable to copy collision JSON:",
            error
        );
    }


    document.body.removeChild(
        textarea
    );


    collisionEditorInfo.textContent =
        copied
            ? "Collision JSON copied to clipboard."
            : "Copy failed. Use the browser console to retrieve the JSON.";
}


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(timestamp) {

    if (
        lastTime === 0
    ) {

        lastTime =
            timestamp;


        requestAnimationFrame(
            gameLoop
        );

        return;
    }


    const deltaTime =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.1
        );


    lastTime =
        timestamp;


    updateMovement(
        deltaTime
    );


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// BUTTON EVENTS
// ==========================================

document
    .getElementById(
        "new-game-btn"
    )
    .addEventListener(
        "click",
        newGame
    );


document
    .getElementById(
        "load-game-btn"
    )
    .addEventListener(
        "click",
        loadGame
    );


document
    .getElementById(
        "menu-btn"
    )
    .addEventListener(
        "click",
        openMenu
    );


document
    .getElementById(
        "close-menu-btn"
    )
    .addEventListener(
        "click",
        closeMenu
    );


document
    .getElementById(
        "save-btn"
    )
    .addEventListener(
        "click",
        saveGame
    );


document
    .getElementById(
        "title-btn"
    )
    .addEventListener(
        "click",
        quitToTitle
    );


// ==========================================
// STARTUP
// ==========================================

initializeDevTools();

closeInventory();


document
    .getElementById(
        "new-game-btn"
    )
    .disabled = true;


document
    .getElementById(
        "load-game-btn"
    )
    .disabled = true;


titleMessage.textContent =
    "Loading game data...";


loadGameData();


requestAnimationFrame(
    gameLoop
);
